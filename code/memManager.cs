using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using USCG.Core.Telemetry;
using UnityEngine.UI;

public class memManager : MonoBehaviour
{
    List<GameObject> memories = new List<GameObject>();
    [SerializeField] public TMP_Text textPrefab;
    [SerializeField] public GameObject popupsPrefab;
    [SerializeField] public Canvas canvas; 
    [SerializeField] public AudioSource tutMusic;
    [SerializeField] public AudioSource music;
    [SerializeField] public AudioSource finalMusic;
    [SerializeField] public AudioSource source;
    [SerializeField] public AudioSource skipSound;
    [SerializeField] public GameObject endPopup;
    public GameObject effect;
    public Image image;
    float totalTime = 0;
    float perStoryTime = 0;
    bool hideTutorial = false;
    float effectTime = 0;

    private MetricId _totalSceneTime = default;
    private MetricId _perStoryTime = default;

    void Start()
    {
        // telemetry
        _totalSceneTime = TelemetryManager.instance.CreateSampledMetric<float>("totalSceneTime");
        _perStoryTime = TelemetryManager.instance.CreateSampledMetric<float>("_perStoryTime");

        // load memories from json
        string filename = "" + gameManager.instance.day;
        TextAsset levelFile = Resources.Load<TextAsset>(filename);
        string json = levelFile.text;
        StoryList storyList = JsonUtility.FromJson<StoryList>(json);

        foreach (var story in storyList.stories)
        {
            if (gameManager.instance.GetStatus(story.name) == story.requiredFlag) {
                GameObject memObj = Instantiate(popupsPrefab, canvas.transform);
                slightOffset(memObj);
                Memory mem = memObj.GetComponent<Memory>();
                mem.Initialize(story.name, story.description, story.image, this, textPrefab);

                foreach (var line in story.lines)
                {
                    Vector3 position = new Vector3(line.position[0], line.position[1], line.position[2]);
                    mem.AddLine(line.character, line.flag, line.text, position);
                }

                memories.Add(memObj);
                memObj.SetActive(false);
            }
        }

        hideTutorial = true;

        if (gameManager.instance.day == 1) {
            tutMusic.Play();
        } else {
            GameObject.Find("instructionCanvas").SetActive(false);
        } 
        if (gameManager.instance.day == 3) {
            music.Play();
        } else {
            GameObject.Find("day3Canvas").SetActive(false);
        } 
        if (gameManager.instance.day == 4) {
            music.Play();
        } else {
            GameObject.Find("day4Canvas").SetActive(false);
        } 
        if (gameManager.instance.day == 5) {
            finalMusic.Play();
        } else {
            GameObject.Find("day5Canvas").SetActive(false);
        }
    }

    void Update() 
    {
        totalTime += Time.deltaTime;
        perStoryTime += Time.deltaTime;
        if (effectTime < -2.0f && effectTime > -3.0f)
            effect.SetActive(false);
        effectTime -= Time.deltaTime;
    }

    public void activateFirstDay() {
        memories[0].SetActive(true);
    }

    public void playSkip() {
        skipSound.Play();
    }

    public void next() 
    {
        TelemetryManager.instance.AddMetricSample(_perStoryTime, perStoryTime);
        perStoryTime = 0;

        if (memories.Count <= 1) // no more stories
        {
            memories[0].SetActive(false);
            Vector3 position = new Vector3(80, 30, 0);
            TMP_Text instantiatedText = Instantiate(textPrefab, endPopup.GetComponent<RectTransform>()); 
            RectTransform trans = instantiatedText.GetComponent<RectTransform>();
            trans.anchoredPosition = position;
            string flagText = gameManager.instance.GetFlags();
            instantiatedText.text = "\r\nNo more subjects in range."; 
            endPopup.SetActive(true);
            gameManager.instance.day += 1;
            if (gameManager.instance.day == 2)
                gameManager.instance.day += 1; //there is no day 2
        } 
        else 
        {
            memories[0].SetActive(false);
            memories.RemoveAt(0);
            memories[0].SetActive(true);
        }
        if (hideTutorial) {
            hideTutorial = false;
            GameObject.Find("memoryInstruction").SetActive(false);
        }
    }

    public void delete(string character, string flag) 
    {
        source.Play();
        if (!string.IsNullOrEmpty(flag)) {
            gameManager.instance.AddFlag(character, flag);
            effect.SetActive(true);
            effectTime = 0.25f;
        }
        next();
    }

    public void goToScene() {
        TelemetryManager.instance.AddMetricSample(_totalSceneTime, totalTime);
        string nextScene = "day" + (gameManager.instance.day-1) + "Map";
        if (gameManager.instance.day == 3)
            nextScene = "day1Map";
        if (gameManager.instance.day == 6)
            nextScene = "finalMap";
        SceneManager.LoadScene (sceneName:nextScene);
    }

    private void slightOffset(GameObject obj) {
        Vector3 originalPosition = obj.transform.position;
        float variationAmount = 5.5f; 
        Vector3 randomOffset = new Vector3(
            Random.Range(-variationAmount, variationAmount),
            Random.Range(-variationAmount, variationAmount),
            0
        );
        obj.transform.position = originalPosition + randomOffset;
    }
}
