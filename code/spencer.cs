// This is the code controlling the eraser character that follows you in Drawn Together. Unity C#

using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class spencer : MonoBehaviour
{
   [Header("Input keys")]
	public Enums.KeyGroups typeOfControl = Enums.KeyGroups.ArrowKeys;

	[Header("Movement")]
	[Tooltip("Speed of movement")]
	public float speed = 5f;
	public Enums.MovementType movementType = Enums.MovementType.AllDirections;

	[Header("Orientation")]
	public bool orientToDirection = false;
	// the direction that will face the player
	public Enums.Directions lookAxis = Enums.Directions.Up;

	private Vector3 movement, cachedDirection;
	private float moveHorizontal;
	private float moveVertical;
    Queue<float> queue = new Queue<float>();
    Queue<bool> jump = new Queue<bool>();

    // animations
    public Animator animator;

    public float jumpPower = 200;
    public int delay = 1000;
    public int maxJumps = 1;
    [SerializeField]
    public InputManager.InputButton jumpButton;

    int jumpCounter = 0;

    // use this for initialization
    bool grounded = true;
    Rigidbody2D rigidbody2D;
    InputManager inputMgr;
    GameManager gameMgr;

    private void Start()
    {
        animator = GetComponent<Animator>();
        for (int i = 0; i < delay; i++)
            queue.Enqueue(0);
        for (int i = 0; i < delay; i++)
            jump.Enqueue(false);

        animator = GetComponent<Animator>();

        rigidbody2D = GetComponent<Rigidbody2D>();
        if (rigidbody2D.velocity.y == 0) 
            grounded = true;
        else 
            grounded = false;

        if (animator) 
            animator.SetBool("isGrounded", grounded);

        gameMgr = GameManager.Inst();
        gameMgr.onPause += OnPause;
        inputMgr = gameMgr.InputManager();
    }

    void OnDestroy()
    {
        gameMgr.onPause -= OnPause;
    }

    public void ResetJumpCounter()
    {
        jumpCounter = 0;
    }

    // Update gets called every frame
    void Update ()
	{
        // moving with the arrow keys
        if(typeOfControl == Enums.KeyGroups.ArrowKeys)
		{
			queue.Enqueue(Input.GetAxis("Horizontal"));
		}
		else if (typeOfControl == Enums.KeyGroups.WASD)
		{
			queue.Enqueue(Input.GetAxis("Horizontal2"));
		}
    
        // zero-out the axes that are not needed, if the movement is constrained
        switch(movementType)
		{
			case Enums.MovementType.OnlyHorizontal:
				moveVertical = 0f;
				break;
			case Enums.MovementType.OnlyVertical:
				moveHorizontal = 0f;
				break;
		}
			
        if (queue.Count != 0) {
            float val = queue.Dequeue();
		    movement = new Vector3(val, 0);
            if(animator != null) animator.SetFloat("runSpeed", Mathf.Abs(val) *2f);
        } else {
            movement = new Vector3(0, 0);
            if(animator != null) animator.SetFloat("runSpeed", 0);
        }

		// rotate the GameObject towards the direction of movement
		// the axis to look can be decided with the "axis" variable
		if(orientToDirection)
		{
			if(movement.sqrMagnitude >= 0.01f)
			{
				cachedDirection = movement;
			}
			Utils.SetAxisTowards(lookAxis, transform, cachedDirection);
		}

        // jump code
         if (gameMgr.isPaused) return;

        if (!grounded && Mathf.Abs(rigidbody2D.velocity.y) < 0.000001f)
        {
            grounded = true;
            ResetJumpCounter();
        }
        if (jumpButton == InputManager.InputButton.Up1) 
            jump.Enqueue(inputMgr.GetUpFirstPress());
        else 
            jump.Enqueue(inputMgr.GetKeyDown(jumpButton));

        bool pressed = jump.Dequeue();
        if (pressed && grounded == true)
        {
            rigidbody2D.AddForce(transform.up * jumpPower);
            grounded = false;
            jumpCounter++;
        }
	}

	// FixedUpdate is called every frame when the physics are calculated
	void FixedUpdate ()
	{
        transform.position += movement * (Time.deltaTime) * speed * 10f;
	}


    // set the horizontal move direction to left (-1) or right (1)
    // called by mobile input UI buttons
    public void SetHorizontalInput(int input)
    {
        moveHorizontal = input;
    }

    public void SetMoveLeft()
    {
        moveHorizontal = -1;
    }

    public void SetMoveRight()
    {
        moveHorizontal = 1;
    }

    public void StopMoving()
    {
		queue.Enqueue(0);
    }
}
