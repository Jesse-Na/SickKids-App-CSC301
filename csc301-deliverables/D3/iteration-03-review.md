# 43 Venus

 > _Note:_ This document is meant to be written during (or shortly after) your review meeting, which should happen fairly close to the due date.      
 >      
 > _Suggestion:_ Have your review meeting a day or two before the due date. This way you will have some time to go over (and edit) this document, and all team members should have a chance to make their contribution.


## Iteration 03 - Review & Retrospect

 * When: November 14 2023
 * Where: Online

## Process - Reflection


#### Q1. What worked well

1. Switching to Agile. It significantly enhanced our project management and adaptability. Regular sprints and stand-up meetings have been instrumental in allowing us to swiftly adapt to new requirements and efficiently tackle emerging issues.
2. More thoughtful delegation of tasks at the beginning of the deliverable. This was done within subteams and gave us more structure in our workflow. Alongside Agile, this made for much more efficient work since we could manage each group members' workload better and spread work out more evenly.
3. Learning new frameworks for frontend testing. This was quite helpful in making testing more efficient, but it did not allow us to implement functionality that would have been impossible before. The relative increase is efficiency was helpful but not as helpful as Agile or better task delegation.

#### Q2. What did not work well

1. Our documentation process has been inconsistent. This had lead to challenges in tracking project changes and decisions. It has also occasionally slowed down our work process, particularly when revisiting past decisions.
2. There was a lack of communication between subteam members, which lead to reduced visibility of the project as a whole. This may impact end too end testing and other aspects of the project that require a project-wide scope. Each subteam's code base has essentially no dependencies on subteam's code, which made it really easy for work to be done in parallel. However, this is also one of the reasons there has been very little commmunication between subteams. Again, this hasn't been a problem yet but we anticipate it will become a problem.


#### Q3(a). Planned changes

1. Our goal now is to streamline and standardize our documentation processes. We're focusing on keeping our internal wikis updated, maintaining comprehensive records of meetings and decisions, and ensuring thorough documentation of our code. This strategy is aimed at enhancing accessibility and clarity of information for the entire team, thereby improving our overall efficiency and knowledge sharing.
2. We will conduct regular checkins across subteams by doing a small demo or update of the work and how it ties in with existing functionality. It'll help each subteam stay updated on the progress being made on the project.

#### Q3(b). Integration & Next steps
The merge was surprisingly easy; aside from a few minor (and we mean very minor) conflicts, there were no issues. In this sense, D2 was quite helpful because our subteams and their work were divided such that there were no dependencies between the user stories of the different subteams. For next steps, we will continue working in subteams to finish up the remaining user stories.


## Product - Review

#### Q4. How was your product demo?
 * Demo Preparation: After we deployed the app and website, we went to the SickKids hospital and connected the app via Bluetooth with one of their compression garments. We have been working closely with our partner throughout the entire process with regular in-person meetings and collaboration sessions, so the demo did not require much additional preparation.
 * Demo Contents: We demoed the basic functionalities of the mobile app and the web application. We also demoed the mobile app connecting to the BLE device (compression garment), collecting data, and having the mobile app send data to the backend database. All of this is visible in the video we recorded, which can be found on the readme.
 * Partner Feedback: All features were accepted.
 * Lessons Learned: There are two things we need to do going forward. The first is the implement the questionnaire feature (a user story). This is the highest priority item right now as it is part of the core functionality of the mobile app. The second item is changing the way data is collected and sent to the backend. Currently, the data is formatted and cleaned. However, we need to send the raw data to the database so that the researchers can make their own decisions on how to process, clean, and use the data.
