#include "Portal.h"
#include "Game.h"
#include "PortalMeshComponent.h"
#include "MeshComponent.h"
#include "Renderer.h"
#include "Player.h"
#include "CameraComponent.h"
#include "CollisionComponent.h"

Portal::Portal(class Game *game, bool isBlue, Vector3 normal)
    : Actor(game)
{
    PortalMeshComponent *pMesh = new PortalMeshComponent(this);
    MeshComponent *mesh = new MeshComponent(this, true);
    mesh->SetMesh(game->GetRenderer()->GetMesh("Assets/Meshes/Portal.gpmesh"));
    if (isBlue)
    {
        pMesh->SetTextureIndex(0);
        mesh->SetTextureIndex(2);
    }
    else
    {
        pMesh->SetTextureIndex(1);
        mesh->SetTextureIndex(3);
    }
    mIsBlue = isBlue;
    mCollide = new CollisionComponent(this);
    if (abs(normal.x) == 1.0f)
        mCollide->SetSize(110.0f, 125.0f, 10.0f);
    else if (abs(normal.y) == 1.0f)
        mCollide->SetSize(10.0f, 125.0f, 110.0f);
    else
        mCollide->SetSize(110.0f, 10.0f, 125.0f);
    mNormal = normal;
}

Vector3 Portal::GetPortalOutVector(const Vector3 initial, Portal *exit, float w)
{
    Matrix4 inverseWorldTransform = GetWorldTransform();
    inverseWorldTransform.Invert();
    Vector3 portalForward = Vector3::Transform(initial, inverseWorldTransform, w);
    portalForward = Vector3::Transform(portalForward, Matrix4::CreateRotationZ(Math::Pi), w);
    return Vector3::Transform(portalForward, exit->GetWorldTransform(), w);
}

void Portal::CalcViewMatrix(struct PortalData &portalData, Portal *exitPortal)
{
    if (!exitPortal)
    {
        portalData.mView = Matrix4::CreateScale(0.0f);
        return;
    }
    Player *player = mGame->GetPlayer();
    portalData.mCameraPos = GetPortalOutVector(player->GetPosition(), exitPortal, 1.0f);
    portalData.mCameraForward = GetPortalOutVector(player->GetCamera()->GetCameraForward(),
                                                   exitPortal, 0.0f);
    portalData.mCameraUp = exitPortal->GetWorldTransform().GetZAxis();
    portalData.mView = Matrix4::CreateLookAt(portalData.mCameraPos,
                                             portalData.mCameraPos +
                                                 portalData.mCameraForward * PORTAL_TARGET_DIST,
                                             portalData.mCameraUp);
}

void Portal::OnUpdate(float deltaTime)
{
    if (mIsBlue)
        CalcViewMatrix(GetGame()->GetRenderer()->GetBluePortal(), GetGame()->GetOrangePortal());
    else
        CalcViewMatrix(GetGame()->GetRenderer()->GetOrangePortal(), GetGame()->GetBluePortal());
}
