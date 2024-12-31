// This is code for the turret head in Portal. C++

#include "Actor.h"
#include "TurretHead.h"
#include "Game.h"
#include "MeshComponent.h"
#include "Mesh.h"
#include "Renderer.h"
#include "LaserComponent.h"
#include "HealthComponent.h"
#include "Random.h"
#include "CollisionComponent.h"
#include "TurretBase.h"
#include "Portal.h"
#include "Prop.h"

TurretHead::TurretHead(Game *game, Actor *parent)
    : Actor(game, parent)
{
    SetScale(0.75f);
    MeshComponent *mc = new MeshComponent(this);
    mc->SetMesh(game->GetRenderer()->GetMesh("Assets/Meshes/TurretHead.gpmesh"));
    SetPosition(Vector3(0.0f, 0.0f, 18.75f));

    mLaserActor = new Actor(game, this);
    mLaserActor->SetPosition(Vector3(0, 0, 10));
    mLaser = new LaserComponent(mLaserActor);
    mLaser->SetIgnore(parent);
}

void TurretHead::OnUpdate(float deltaTime)
{
    mStateTimer += deltaTime;
    mTeleportCooldown += deltaTime;
    switch (mState)
    {
    case TurretState::Idle:
        UpdateIdle(deltaTime);
        break;
    case TurretState::Search:
        UpdateSearch(deltaTime);
        break;
    case TurretState::Priming:
        UpdatePriming(deltaTime);
        break;
    case TurretState::Firing:
        UpdateFiring(deltaTime);
        break;
    case TurretState::Falling:
        UpdateFalling(deltaTime);
        break;
    case TurretState::Dead:
        break;
    }
    CheckTarget();
}

void TurretHead::UpdateIdle(float deltaTime)
{
    if (CheckTeleport())
    {
        ChangeState(TurretState::Falling);
        return;
    }
    if (mTarget)
        ChangeState(TurretState::Priming);
}

void TurretHead::UpdateSearch(float deltaTime)
{
    if (CheckTeleport())
    {
        ChangeState(TurretState::Falling);
        return;
    }
    if (mTarget)
        ChangeState(TurretState::Priming);
    else
    {
        if (mStateTimer > 5.0f)
        {
            SetQuat(
                Quaternion::Slerp(GetQuat(), Quaternion::Identity, (mStateTimer - 5.0f) / 0.5f));
            if (mStateTimer > 5.5f)
                ChangeState(TurretState::Idle);
        }
        else
        {
            if (mSearchTime == 0.0f)
            {
                Vector3 center = GetPosition() + FWD_DIST * Vector3::UnitX;
                float randAngle = Random::GetFloatRange(-Math::Pi, Math::Pi);
                Vector3 targetPoint = center + Vector3(0.0f, SIDE_DIST * Math::Cos(randAngle),
                                                       UP_DIST * Math::Sin(randAngle));
                Vector3 newFacing = Vector3::Normalize(targetPoint - GetPosition());
                float dot = Vector3::Dot(Vector3::UnitX, newFacing);
                Quaternion quat;
                Vector3 axis = Vector3::Normalize(Vector3::Cross(Vector3::UnitX, newFacing));
                float angle = Math::Acos(dot);
                mTargetQuat = Quaternion(axis, angle);
            }
            Quaternion currQuat;
            if (mSearchTime <= 0.5f)
                currQuat = Quaternion::Slerp(Quaternion::Identity, mTargetQuat, mSearchTime / 0.5f);
            else
                currQuat = Quaternion::Slerp(mTargetQuat, Quaternion::Identity,
                                             (mSearchTime - 0.5f) / 0.5f);
            mSearchTime += deltaTime;
            if (mSearchTime >= 1.0f)
                mSearchTime = 0.0f;
            SetQuat(currQuat);
        }
    }
}

void TurretHead::UpdatePriming(float deltaTime)
{
    if (CheckTeleport())
    {
        ChangeState(TurretState::Falling);
        return;
    }
    if (mLaser->GetLastHitActor() != mTarget)
    {
        ChangeState(TurretState::Search);
    }
    else if (mStateTimer >= 1.5f)
    {
        mFireCooldown = 0.05f;
        ChangeState(TurretState::Firing);
    }
}

void TurretHead::UpdateFiring(float deltaTime)
{
    if (CheckTeleport())
    {
        ChangeState(TurretState::Falling);
        return;
    }
    if (mLaser->GetLastHitActor() != mTarget)
    {
        ChangeState(TurretState::Search);
    }
    else if (mTarget->GetComponent<HealthComponent>() &&
             !mTarget->GetComponent<HealthComponent>()->IsDead() && mFireCooldown >= 0.05f)
    {
        mFireCooldown = 0.0f;
        mTarget->GetComponent<HealthComponent>()->TakeDamage(2.5f, GetWorldPosition());
        mGame->GetAudio()->PlaySound("Bullet.ogg", false, mTarget);
    }
    mFireCooldown += deltaTime;
}

void TurretHead::UpdateFalling(float deltaTime)
{
    TurretBase *parent = static_cast<TurretBase *>(GetParent());
    Vector3 position = parent->GetPosition() + mFallVelocity * deltaTime;
    if (CheckTeleport())
    {
        ChangeState(TurretState::Falling);
        return;
    }
    mFallVelocity += Vector3(0, 0, -980) * deltaTime;

    for (Actor *collide : GetGame()->GetColliders())
    {
        Vector3 offset;
        CollSide side =
            parent->GetCollide()->GetMinOverlap(static_cast<Prop *>(collide)->GetCollide(), offset);
        if (side != CollSide::None && collide != parent)
        {
            position += offset;
            if (side == CollSide::Top && mFallVelocity.z < 0.0f)
            {
                position.z -= 15.0f;
                Die();
                if (TurretBase *other = dynamic_cast<TurretBase *>(collide))
                {
                    position.z -= parent->GetCollide()->GetHeight() / 2;
                    other->Die();
                }
            }
        }
    }

    parent->SetPosition(position);

    if (mFallVelocity.Length() > 800.0f)
        mFallVelocity = Vector3::Normalize(mFallVelocity) * 800.0f;
}

void TurretHead::UpdateDead(float deltaTime)
{
    if (CheckTeleport())
    {
        ChangeState(TurretState::Falling);
        return;
    }
}

void TurretHead::ChangeState(TurretState state)
{
    if (state != mState)
    {
        AudioSystem *audio = mGame->GetAudio();
        if (mCurrSound != SoundHandle::Invalid &&
            audio->GetSoundState(mCurrSound) == SoundState::Playing)
            audio->StopSound(mCurrSound);
        mCurrSound = audio->PlaySound(mSoundMap.find(state)->second, false, this);
        mState = state;
        mStateTimer = 0.0f;
    }
}

void TurretHead::CheckTarget()
{
    Actor *lastHit = mLaser->GetLastHitActor();
    if (lastHit && lastHit->GetComponent<HealthComponent>() &&
        !lastHit->GetComponent<HealthComponent>()->IsDead())
        mTarget = lastHit;
    else
        mTarget = nullptr;
}

bool TurretHead::CheckTeleport()
{
    Game *game = GetGame();
    Portal *blue = game->GetBluePortal();
    Portal *orange = game->GetOrangePortal();

    // check if both portals exist
    if (blue == nullptr || orange == nullptr)
        return false;

    // check intersection
    TurretBase *parent = static_cast<TurretBase *>(GetParent());
    CollisionComponent *collide = parent->GetCollide();
    bool intersectBlue = collide->Intersect(blue->GetCollide());
    bool intersectOrange = collide->Intersect(orange->GetCollide());
    if (intersectBlue || intersectOrange)
    {
        // check cooldown
        if (mTeleportCooldown >= TELEPORT_COOLDOWN)
            mTeleportCooldown = 0.0f;
        else
            return false;

        if (intersectBlue)
        {
            parent->SetPosition(orange->GetPosition());
            mFallVelocity += orange->GetNormal() * 250;
        }
        else
        {
            parent->SetPosition(blue->GetPosition());
            mFallVelocity += blue->GetNormal() * 250;
        }
        return true;
    }
    else
        return false;
}

void TurretHead::Die()
{
    ChangeState(TurretState::Dead);
    GetParent()->SetQuat(Quaternion(Vector3::UnitX, Math::PiOver2));
    mLaser->Disable();
}

void TurretHead::TakeDamage()
{
    if (!mDamageTaken)
    {
        AudioSystem *audio = mGame->GetAudio();
        if (mCurrSound != SoundHandle::Invalid &&
            audio->GetSoundState(mCurrSound) == SoundState::Playing)
            audio->StopSound(mCurrSound);
        mCurrSound = audio->PlaySound("TurretFriendlyFire.ogg", false, this);
    }
    mDamageTaken = true;
}