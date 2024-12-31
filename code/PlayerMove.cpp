#include "PlayerMove.h"
#include "Player.h"
#include "Actor.h"
#include "Game.h"
#include "MoveComponent.h"
#include "CameraComponent.h"
#include "Prop.h"
#include "Crosshair.h"
#include "Renderer.h"
#include "SegmentCast.h"
#include "Block.h"
#include "Portal.h"
#include "HealthComponent.h"

PlayerMove::PlayerMove(class Actor *owner)
    : MoveComponent(owner)
{
    ChangeState(OnGround);
    mCrosshair = new Crosshair(owner);
    AudioSystem *audio = GetGame()->GetAudio();
    mFootstepSound = audio->PlaySound("FootstepLoop.ogg", true);
    audio->PauseSound(mFootstepSound);
}

PlayerMove::~PlayerMove()
{
    GetGame()->GetAudio()->StopSound(mFootstepSound);
}

void PlayerMove::Update(float deltaTime)
{
    Game *game = GetGame();
    AudioSystem *audio = game->GetAudio();

    if (mOwner->GetComponent<HealthComponent>()->IsDead())
    {
        if (audio->GetSoundState(static_cast<Player *>(mOwner)->GetDeathSound()) ==
            SoundState::Stopped)
            game->ReloadLevel();
        else
            return;
    }
    // kill if fell too far
    if (mOwner->GetPosition().z <= RESET_Z)
    {
        mOwner->GetComponent<HealthComponent>()->TakeDamage(Math::Infinity, mOwner->GetPosition());
        return;
    }

    switch (mCurrentState)
    {
    case OnGround:
        UpdateOnGround(deltaTime);
        break;
    case Jump:
        UpdateJump(deltaTime);
        break;
    case Falling:
        UpdateFalling(deltaTime);
        break;
    }

    // update teleport cooldown
    mTeleportCooldown += deltaTime;

    if (mCurrentState == MoveState::OnGround && mVelocity.Length() > 50)
        audio->ResumeSound(mFootstepSound);
    else
        audio->PauseSound(mFootstepSound);
}

void PlayerMove::ProcessInput(const Uint8 *keyState, Uint32 mouseButtons,
                              const Vector2 &relativeMouse)
{
    if (!mOwner->GetComponent<HealthComponent>()->IsDead())
    {
        Game *game = GetGame();
        AudioSystem *audio = game->GetAudio();

        // forward
        float forwardScale = 0.0f;
        if (keyState[SDL_SCANCODE_W])
            forwardScale += MOVE_SPEED;
        if (keyState[SDL_SCANCODE_S])
            forwardScale -= MOVE_SPEED;
        AddForce(mOwner->GetForward() * forwardScale);

        // strafe
        float strafeScale = 0.0f;
        if (keyState[SDL_SCANCODE_D])
            strafeScale += MOVE_SPEED;
        if (keyState[SDL_SCANCODE_A])
            strafeScale -= MOVE_SPEED;
        AddForce(mOwner->GetRight() * strafeScale);

        // jump
        if (keyState[SDL_SCANCODE_SPACE] && mCurrentState == MoveState::OnGround &&
            !mLastFrame.find(Space)->second)
        {
            AddForce(mJumpForce);
            ChangeState(Jump);
            audio->PlaySound("Jump.ogg");
        }

        // portals
        if (static_cast<Player *>(mOwner)->HasGun())
        {
            if (mouseButtons & SDL_BUTTON(SDL_BUTTON_LEFT) && !mLastFrame.find(Left)->second)
                CreatePortal(true);
            if (mouseButtons & SDL_BUTTON(SDL_BUTTON_RIGHT) && !mLastFrame.find(Right)->second)
                CreatePortal(false);
        }

        // reset
        if (keyState[SDL_SCANCODE_R] && !mLastFrame.find(Reset)->second)
        {
            Portal *blue = game->GetBluePortal();
            Portal *orange = game->GetOrangePortal();
            if (blue || orange)
                audio->PlaySound("PortalClose.ogg");

            if (blue)
            {
                blue->SetState(ActorState::Destroy);
                game->SetBlue(nullptr);
            }
            if (orange)
            {
                orange->SetState(ActorState::Destroy);
                game->SetOrange(nullptr);
            }
            mCrosshair->SetState(CrosshairState::Default);
        }

        // set previous frame bools
        mLastFrame.find(Space)->second = keyState[SDL_SCANCODE_SPACE];
        mLastFrame.find(Left)->second = mouseButtons & SDL_BUTTON(SDL_BUTTON_LEFT);
        mLastFrame.find(Right)->second = mouseButtons & SDL_BUTTON(SDL_BUTTON_RIGHT);
        mLastFrame.find(Reset)->second = keyState[SDL_SCANCODE_R];

        // camera
        float angularSpeed = relativeMouse.x / MOUSE_CONST * ANGULAR_SPEED;
        SetAngularSpeed(angularSpeed);
        float pitchSpeed = relativeMouse.y / MOUSE_CONST * ANGULAR_SPEED;
        game->GetPlayer()->GetCamera()->SetPitchSpeed(pitchSpeed);
    }
}

void PlayerMove::UpdateOnGround(float deltaTime)
{
    PhysicsUpdate(deltaTime);
    if (UpdatePortalTeleport())
        return;
    bool falling = true;
    for (Actor *collide : GetGame()->GetColliders())
    {
        CollSide side = FixCollision(static_cast<Player *>(mOwner)->GetCollide(),
                                     static_cast<Prop *>(collide)->GetCollide());
        if (side == CollSide::Top)
            falling = false;
    }
    if (falling)
        ChangeState(Falling);
}

void PlayerMove::UpdateJump(float deltaTime)
{
    AddForce(mGravity);
    PhysicsUpdate(deltaTime);
    if (UpdatePortalTeleport())
        return;
    for (Actor *collide : GetGame()->GetColliders())
    {
        CollSide side = FixCollision(static_cast<Player *>(mOwner)->GetCollide(),
                                     static_cast<Prop *>(collide)->GetCollide());
        if (side == CollSide::Bottom)
            mVelocity.z = 0.0f;
    }
    if (mVelocity.z <= 0.0f)
        ChangeState(Falling);
}

void PlayerMove::UpdateFalling(float deltaTime)
{
    AddForce(mGravity);
    PhysicsUpdate(deltaTime);
    if (UpdatePortalTeleport())
        return;
    bool landed = false;
    for (Actor *collide : GetGame()->GetColliders())
    {
        CollSide side = FixCollision(static_cast<Player *>(mOwner)->GetCollide(),
                                     static_cast<Prop *>(collide)->GetCollide());
        if (side == CollSide::Top && mVelocity.z <= 0.0f)
            landed = true;
    }
    if (landed)
    {
        GetGame()->GetAudio()->PlaySound("Land.ogg");
        mVelocity.z = 0.0f;
        ChangeState(OnGround);
        mTeleporting = false;
    }
}

void PlayerMove::PhysicsUpdate(float deltaTime)
{
    mAcceleration = mPendingForces * (1.0f / mMass);
    mVelocity += mAcceleration * deltaTime;
    FixXYVelocity();
    if (mVelocity.z < MAX_FALLING_VELOCITY)
        mVelocity.z = MAX_FALLING_VELOCITY;
    mOwner->SetPosition(mOwner->GetPosition() + mVelocity * deltaTime);
    mOwner->SetRotation(mOwner->GetRotation() + mAngularSpeed * deltaTime);
    mPendingForces = Vector3::Zero;
}

void PlayerMove::FixXYVelocity()
{
    Vector2 xyVelocity = Vector2(mVelocity.x, mVelocity.y);
    // limit speed to max speed if not teleporting
    if (!mTeleporting && xyVelocity.Length() > MAX_SPEED)
        xyVelocity = Vector2::Normalize(xyVelocity) * MAX_SPEED;
    // brake if on ground
    if (mCurrentState == OnGround)
    {
        bool xOppositeSigns = (mAcceleration.x > 0 && xyVelocity.x < 0) ||
                              (mAcceleration.x < 0 && xyVelocity.x > 0);
        bool yOppositeSigns = (mAcceleration.y > 0 && xyVelocity.y < 0) ||
                              (mAcceleration.y < 0 && xyVelocity.y > 0);
        if (xOppositeSigns || Math::NearlyZero(mAcceleration.x))
            xyVelocity.x *= BRAKE_FACTOR;
        if (yOppositeSigns || Math::NearlyZero(mAcceleration.y))
            xyVelocity.y *= BRAKE_FACTOR;
    }
    mVelocity.x = xyVelocity.x;
    mVelocity.y = xyVelocity.y;
}

CollSide PlayerMove::FixCollision(CollisionComponent *self, CollisionComponent *collider)
{
    Vector3 offset;
    CollSide side = self->GetMinOverlap(collider, offset);
    if (side != CollSide::None)
        mOwner->SetPosition(mOwner->GetPosition() + offset);
    return side;
}

void PlayerMove::CreatePortal(bool isBlue)
{
    Game *game = GetGame();
    AudioSystem *audio = game->GetAudio();
    Renderer *renderer = game->GetRenderer();
    Vector3 near = renderer->Unproject(Vector3(0.0f, 0.0f, 0.0f));
    Vector3 far = renderer->Unproject(Vector3(0.0f, 0.0f, 1.0f));
    Vector3 direc = Vector3::Normalize(far - near);
    LineSegment *line = new LineSegment(near, near + SEGMENT_LENGTH * direc);
    CastInfo info;
    if (SegmentCast(game->GetColliders(), *line, info))
    {
        if (!dynamic_cast<Block *>(info.mActor))
        {
            audio->PlaySound("PortalFail.ogg");
            return; // don't create portals on non blocks
        }
        Portal *portal = new Portal(game, isBlue, info.mNormal);
        portal->SetPosition(info.mPoint);

        // find quat
        float dot = Vector3::Dot(Vector3::UnitX, info.mNormal);
        Quaternion quat;
        if (dot == 1.0f)
            quat = Quaternion::Identity;
        else if (dot == -1.0f)
            quat = Quaternion(Vector3::UnitZ, Math::Pi);
        else
        {
            Vector3 axis = Vector3::Normalize(Vector3::Cross(Vector3::UnitX, info.mNormal));
            float angle = Math::Acos(dot);
            quat = Quaternion(axis, angle);
        }
        portal->SetQuat(quat);
        portal->Update(0.0f);

        // destroy existing portals
        Portal *existingBlue = game->GetBluePortal();
        Portal *existingOrange = game->GetOrangePortal();
        if (isBlue)
        {
            audio->PlaySound("PortalShootBlue.ogg");
            if (existingBlue)
                existingBlue->SetState(ActorState::Destroy);
            game->SetBlue(portal);
            if (existingOrange)
                mCrosshair->SetState(CrosshairState::BothFill);
            else
                mCrosshair->SetState(CrosshairState::BlueFill);
        }
        else
        {
            audio->PlaySound("PortalShootOrange.ogg");
            if (existingOrange)
                existingOrange->SetState(ActorState::Destroy);
            game->SetOrange(portal);
            if (existingBlue)
                mCrosshair->SetState(CrosshairState::BothFill);
            else
                mCrosshair->SetState(CrosshairState::OrangeFill);
        }
    }
    else
        audio->PlaySound("PortalFail.ogg");
}

bool PlayerMove::UpdatePortalTeleport()
{
    Game *game = GetGame();
    Portal *blue = game->GetBluePortal();
    Portal *orange = game->GetOrangePortal();

    // check if both portals exist
    if (blue == nullptr || orange == nullptr)
        return false;

    // check intersection
    CollisionComponent *collide = static_cast<Player *>(mOwner)->GetCollide();
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
            CalcTeleport(blue, orange);
        else
            CalcTeleport(orange, blue);
        GetGame()->GetAudio()->PlaySound("PortalTeleport.ogg");
        return true;
    }
    else
        return false;
}

void PlayerMove::CalcTeleport(Portal *entry, Portal *exit)
{
    // these represent if the exit/entry portal points along the Z axis
    bool exitDirecZ = abs(exit->GetNormal().z) == 1.0f;
    bool entryDirecZ = abs(entry->GetNormal().z) == 1.0f;

    // new rotation of player
    if (!exitDirecZ)
    {
        Vector3 newFacing;
        if (entryDirecZ)
            newFacing = exit->GetQuatForward();
        else
            newFacing = entry->GetPortalOutVector(mOwner->GetForward(), exit, 0);
        float dot = Vector3::Dot(Vector3::UnitX, newFacing);
        float angle = Math::Acos(dot);
        if (newFacing.y < 0)
            angle *= -1;
        mOwner->SetRotation(angle);
    }

    // new velocity of player
    Vector3 velocity;
    if (entryDirecZ || exitDirecZ)
        velocity = exit->GetQuatForward();
    else
        velocity = entry->GetPortalOutVector(mVelocity, exit, 0.0f);
    float velocityMagnitude = std::max(MIN_PORTAL_VELOCITY,
                                       TELEPORT_VELOCITY_MULTIPLIER * mVelocity.Length());
    mVelocity = Vector3::Normalize(velocity) * velocityMagnitude;

    // new position of player
    Vector3 pos;
    if (entryDirecZ || exitDirecZ)
        pos = exit->GetPosition();
    else
        pos = entry->GetPortalOutVector(mOwner->GetPosition(), exit, 1.0f);
    mOwner->SetPosition(pos + exit->GetQuatForward() * TELEPORT_BUFFER);

    ChangeState(MoveState::Falling);
    mTeleporting = true;
}
