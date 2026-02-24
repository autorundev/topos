import { WorkflowTemplate } from '../types';

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = 
[
  {
    "id": "tmpl_copilot",
    "name": "Passive Copilot / Sidecar",
    "description": "Monitors user activity in a primary application and offers context-aware suggestions without blocking the workflow.",
    "primary_use_case": "Code Completion, Writing Assistants, Form Helpers",
    "complexity": "High",
    "tags": [
      "UX",
      "Real-time",
      "Assistant"
    ],
    "common_variations": [
      "Ghost Text",
      "Autocomplete",
      "Smart Paste"
    ],
    "nodes": [
      {
        "x": 1672.9115150787195,
        "y": -399.3096628392083,
        "id": "80132ffc-f985-44be-bf71-b4b1b2bbfc7b",
        "type": "touchpoint",
        "notes": "The main application the user is actively using.",
        "measuredH": 101,
        "measuredW": 180,
        "personaId": "persona-user",
        "customLabel": "Primary App (Work Surface)",
        "referenceId": "tp_web"
      },
      {
        "x": 2478.3635657432637,
        "y": -407.11710981295334,
        "id": "6981f9a7-cc4b-46ed-b0f3-6acb55bab7c9",
        "type": "touchpoint",
        "notes": "A passive copilot surface that never interrupts; shows suggestions when useful.",
        "measuredH": 153,
        "measuredW": 180,
        "personaId": "persona-user",
        "customLabel": "Sidecar (Non-blocking Panel)",
        "referenceId": "tp_overlay_hud"
      },
      {
        "x": 1907.111482130695,
        "y": -394.49328790645717,
        "id": "ab457ecc-f16b-476d-a6e9-3472abac37a9",
        "type": "task",
        "notes": "User edits/navigates without being blocked by AI.",
        "measuredH": 203,
        "measuredW": 280,
        "personaId": "persona-user",
        "attachments": [
          {
            "id": "pc-3-b",
            "type": "constraint",
            "notes": "User opts in to passive monitoring",
            "referenceId": "const_user_consent"
          }
        ],
        "customLabel": "Work Normally",
        "referenceId": "human_navigate_space"
      },
      {
        "x": 1612.2003041589696,
        "y": 130.19622447930684,
        "id": "f3bf19d1-fbb8-4207-a8be-d1b80fcbbb9c",
        "type": "task",
        "notes": "Collect lightweight, privacy-scoped context from the active session.",
        "measuredH": 245,
        "measuredW": 280,
        "attachments": [
          {
            "id": "pc-4-c",
            "type": "constraint",
            "notes": "Minimize captured content; prefer metadata over raw text when possible",
            "referenceId": "const_privacy"
          }
        ],
        "customLabel": "Capture Session Context",
        "referenceId": "system_session"
      },
      {
        "x": 2090.65033018708,
        "y": 115.39490572171529,
        "id": "30f608ef-4aba-47bf-884f-549436dd5926",
        "type": "task",
        "notes": "Detect moments where a suggestion could help (e.g., repeated errors, long pause, complex state).",
        "measuredH": 245,
        "measuredW": 280,
        "attachments": [
          {
            "id": "pc-5-b",
            "type": "constraint",
            "notes": "Do not slow the primary app; async and low overhead",
            "referenceId": "const_latency"
          }
        ],
        "customLabel": "Monitor for Triggers",
        "referenceId": "task_monitor"
      },
      {
        "x": 1679.3212890652826,
        "y": 715.8693078867949,
        "id": "6b01b9c0-814f-4f8d-8e14-8e6c29e32a27",
        "type": "task",
        "notes": "Create a compact representation of what matters now (summary + embeddings).",
        "measuredH": 245,
        "measuredW": 280,
        "attachments": [
          {
            "id": "pc-6-c",
            "type": "constraint",
            "notes": "Hard cap on context size; prioritize recency + user intent",
            "referenceId": "const_context_window"
          }
        ],
        "customLabel": "Represent Context (Compact)",
        "referenceId": "task_represent"
      },
      {
        "x": 2480.1309717800004,
        "y": 123.37013925170541,
        "id": "c42ea785-fda1-4337-a362-2b8c1003ca92",
        "type": "task",
        "notes": "Match current context to known tips, templates, commands, or next steps.",
        "measuredH": 230,
        "measuredW": 280,
        "attachments": [
          {
            "id": "pc-7-b",
            "type": "constraint",
            "notes": "Only suggest when likely helpful; otherwise stay quiet",
            "referenceId": "const_quality_threshold"
          }
        ],
        "customLabel": "Match to Helpful Patterns",
        "referenceId": "task_match"
      },
      {
        "x": 2857.4310578173654,
        "y": 124.11319480726101,
        "id": "45f00e19-fb4a-46dc-8956-46c458b1ca49",
        "type": "task",
        "notes": "Rank candidates by relevance, timing, and intrusiveness; pick top suggestion(s).",
        "measuredH": 230,
        "measuredW": 280,
        "attachments": [
          {
            "id": "pc-8-c",
            "type": "constraint",
            "notes": "If confidence is low, offer a question or do nothing",
            "referenceId": "const_confidence"
          }
        ],
        "customLabel": "Rank + Select",
        "referenceId": "task_rank"
      },
      {
        "x": 3272.2896865328435,
        "y": 149.00355485828516,
        "id": "2f00371f-d90d-4929-9f20-8641fa3b9dc2",
        "type": "task",
        "notes": "Render suggestion in sidecar panel; no modal, no forced decision.",
        "measuredH": 250,
        "measuredW": 280,
        "attachments": [
          {
            "id": "pc-9-b",
            "type": "constraint",
            "notes": "Helpful, optional language; avoid alarms or urgency",
            "referenceId": "const_tone"
          }
        ],
        "customLabel": "Present Suggestion (Non-blocking)",
        "referenceId": "system_notification"
      },
      {
        "x": 2769.300896796655,
        "y": -431.78696154689476,
        "id": "ee49a68b-d295-43b7-b147-54d6c745fced",
        "type": "task",
        "notes": "User can ignore, expand, or apply the suggestion without leaving flow.",
        "measuredH": 203,
        "measuredW": 280,
        "personaId": "persona-user",
        "attachments": [
          {
            "id": "pc-10-c",
            "type": "constraint",
            "notes": "User remains in control; AI never takes action unprompted",
            "referenceId": "const_human_loop"
          }
        ],
        "customLabel": "Ignore / Open / Apply",
        "referenceId": "human_choose"
      },
      {
        "x": 3171.9649455560557,
        "y": -446.59984883310545,
        "id": "12a0c0e2-b041-4cfc-bde9-8a09037cefc0",
        "type": "task",
        "notes": "Aggregate feedback to improve ranking and reduce noise.",
        "measuredH": 245,
        "measuredW": 280,
        "attachments": [
          {
            "id": "pc-11-b",
            "type": "constraint",
            "notes": "Traceability for suggestions shown + user actions",
            "referenceId": "const_audit_log"
          },
          {
            "id": "pc-11-c",
            "type": "constraint",
            "notes": "Short retention window; respect org policy",
            "referenceId": "const_data_retention"
          }
        ],
        "customLabel": "Learn What Helps",
        "referenceId": "system_analytics"
      },
      {
        "x": 1561.5618346118586,
        "y": 71.74003846507813,
        "id": "5bfe24b7-4ebc-4c6d-a890-e5943726afbc",
        "type": "annotation",
        "notes": "Capture → Monitor → Represent → Match → Rank → Present → Learn",
        "width": 2088.202067298524,
        "height": 975.7156130346882,
        "subType": "zone",
        "measuredH": 976,
        "measuredW": 2088,
        "customLabel": "Passive Copilot Core Pipeline",
        "referenceId": "zone_group"
      },
      {
        "x": 1565.008317230743,
        "y": -782.6738942700989,
        "id": "b464e8f3-67ff-4e57-a7f4-75b7cbd54a5b",
        "type": "annotation",
        "notes": "Non-blocking: observes activity, offers suggestions only when useful, user always chooses.",
        "width": 341.0731164859606,
        "height": 109.72199054767862,
        "subType": "note",
        "measuredH": 110,
        "measuredW": 343,
        "customLabel": "Pattern: Passive Copilot / Sidecar",
        "referenceId": "zone_group"
      },
      {
        "x": 1567.7572279714639,
        "y": -619.7631449513435,
        "id": "51e95a6f-ab2a-4998-b704-ea587cb9d291",
        "type": "actor",
        "measuredH": 54,
        "measuredW": 180,
        "referenceId": "176f2018-c87a-4efe-8cc9-6c878c594c8f"
      },
      {
        "id": "5a2c05ee-8687-42c7-a190-5b59cbf6d93e",
        "type": "data",
        "referenceId": "data_signal",
        "x": 1980.3722409796896,
        "y": -147.25366478448097,
        "notes": "Activity signals: UI events, selections, focus, recent actions",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "2bc93a6b-3dbb-4c1f-8b6b-7373c8c6cdf0",
        "type": "data",
        "referenceId": "data_session_history",
        "x": 1710.0118200823192,
        "y": 427.6955014762419,
        "notes": "Recent action trail (bounded window)",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "4020f339-3ffa-4f2e-9fbf-ee174913edf8",
        "type": "data",
        "referenceId": "data_state_vector",
        "x": 1709.044629570621,
        "y": 531.6458432468422,
        "notes": "Current app state summary (what/where user is working)",
        "measuredW": 200,
        "measuredH": 93
      },
      {
        "id": "22f1db56-f04d-475e-8bd2-f2acae5aa5c1",
        "type": "data",
        "referenceId": "data_signal",
        "x": 2190.4733390366378,
        "y": 398.7223393500341,
        "notes": "Trigger signal + type (pause, loop, error, ambiguity, opportunity)",
        "measuredW": 200,
        "measuredH": 78,
        "customLabel": "Trigger Signal"
      },
      {
        "id": "70df28ac-a943-47aa-97bc-98de591c8fc3",
        "type": "data",
        "referenceId": "data_structured_text",
        "x": 2014.4087137012204,
        "y": 747.2196660615093,
        "notes": "Short context summary (bounded tokens)",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "de9a27fd-0b1d-4f95-b55b-62393af3f360",
        "type": "data",
        "referenceId": "data_embedding",
        "x": 2014.1372743583895,
        "y": 858.7359960746049,
        "notes": "Context embedding for retrieval/matching",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "08f16d6f-ef7f-4187-b2f5-32f482a11978",
        "type": "data",
        "referenceId": "data_list",
        "x": 2579.9539806295575,
        "y": 403.01615695082063,
        "notes": "Candidate suggestions (pattern IDs + metadata)",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "9f8cdac6-b290-4b7f-9447-87a6df31b90c",
        "type": "data",
        "referenceId": "data_score",
        "x": 2957.4759030295822,
        "y": 480.5715054533363,
        "notes": "Suggestion scores (relevance, confidence, interruption cost)",
        "measuredW": 200,
        "measuredH": 93
      },
      {
        "id": "ae374bc0-923d-42c3-a191-eebe25d13ebe",
        "type": "data",
        "referenceId": "data_selection",
        "x": 2957.3749917104133,
        "y": 383.0226939446362,
        "notes": "Chosen suggestion payload",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "4dbda383-87e2-4401-9ba9-fadf25a536fc",
        "type": "data",
        "referenceId": "data_markup",
        "x": 3373.5218765573286,
        "y": 436.326839287272,
        "notes": "Suggestion card UI content (title, rationale, action)",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "18bd94d3-e6b9-4d39-a570-5f662dfd8094",
        "type": "data",
        "referenceId": "data_preference_profile",
        "x": 2868.8900657975887,
        "y": -176.4965787270999,
        "notes": "User preference updates (what they find useful)",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "deaf111b-9600-4157-8406-6428364508a9",
        "type": "data",
        "referenceId": "data_signal",
        "x": 2868.890065797589,
        "y": -71.79069637415861,
        "notes": "Feedback signal (accepted, dismissed, modified)",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "e7cac6cc-5b86-4ac3-bc8b-60f663281699",
        "type": "data",
        "referenceId": "data_log",
        "x": 3272.3572494592445,
        "y": -171.57819712780372,
        "notes": "Anonymized interaction log (opt-in)",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "a2e51163-ccbf-4975-bcad-0862e7bd704c",
        "referenceId": "zone_group",
        "type": "annotation",
        "x": 1561.9809469929698,
        "y": -529.9275367307249,
        "subType": "zone",
        "width": 771.0952380952383,
        "height": 557.2380952380953,
        "measuredW": 771,
        "measuredH": 557,
        "customLabel": "Primary Observation"
      },
      {
        "id": "247d2aeb-60a6-4166-bf13-e430692ace87",
        "referenceId": "zone_group",
        "type": "annotation",
        "x": 2369.6793596913826,
        "y": -527.9275367307249,
        "subType": "zone",
        "width": 1276.301587301588,
        "height": 554.0634920634922,
        "measuredW": 1275,
        "measuredH": 554,
        "customLabel": "Suggestion Notification"
      }
    ],
    "edges": [
      {
        "id": "71a67388-abd7-43ae-a585-82710f881df8",
        "source": "80132ffc-f985-44be-bf71-b4b1b2bbfc7b",
        "target": "ab457ecc-f16b-476d-a6e9-3472abac37a9"
      },
      {
        "id": "b1fedd12-b3b4-4f4e-a83f-a4eefb21500f",
        "source": "6981f9a7-cc4b-46ed-b0f3-6acb55bab7c9",
        "target": "ee49a68b-d295-43b7-b147-54d6c745fced"
      },
      {
        "id": "8ba2a719-1091-46f9-86c0-70c9b069e02b",
        "source": "51e95a6f-ab2a-4998-b704-ea587cb9d291",
        "target": "80132ffc-f985-44be-bf71-b4b1b2bbfc7b"
      },
      {
        "id": "5dec72d2-ca4e-46ba-914b-dae18c857eb3",
        "source": "51e95a6f-ab2a-4998-b704-ea587cb9d291",
        "target": "6981f9a7-cc4b-46ed-b0f3-6acb55bab7c9",
        "waypoints": [
          {
            "x": 2348.2520480394487,
            "y": -567
          },
          {
            "x": 2348.2520480394487,
            "y": -299
          }
        ]
      },
      {
        "id": "dcdc0dac-8012-401c-9c3d-db8bdad8b621",
        "source": "ab457ecc-f16b-476d-a6e9-3472abac37a9",
        "target": "5a2c05ee-8687-42c7-a190-5b59cbf6d93e"
      },
      {
        "id": "9f8c618f-0d41-420f-ad2c-32b007efd398",
        "source": "f3bf19d1-fbb8-4207-a8be-d1b80fcbbb9c",
        "target": "2bc93a6b-3dbb-4c1f-8b6b-7373c8c6cdf0"
      },
      {
        "id": "42ecc9dc-a4ef-4247-90d9-157d08350be2",
        "source": "f3bf19d1-fbb8-4207-a8be-d1b80fcbbb9c",
        "target": "4020f339-3ffa-4f2e-9fbf-ee174913edf8"
      },
      {
        "id": "a5fbdbc4-f1c8-48e3-a523-252e8d62ed17",
        "source": "30f608ef-4aba-47bf-884f-549436dd5926",
        "target": "22f1db56-f04d-475e-8bd2-f2acae5aa5c1"
      },
      {
        "id": "ba1eacf6-de7a-4cd5-b46d-19bea28701e7",
        "source": "6b01b9c0-814f-4f8d-8e14-8e6c29e32a27",
        "target": "70df28ac-a943-47aa-97bc-98de591c8fc3"
      },
      {
        "id": "eaff32e8-b547-47ec-b4e3-ed68f98a34d4",
        "source": "6b01b9c0-814f-4f8d-8e14-8e6c29e32a27",
        "target": "de9a27fd-0b1d-4f95-b55b-62393af3f360"
      },
      {
        "id": "b61f6517-4642-4dce-b616-206c7a673339",
        "source": "c42ea785-fda1-4337-a362-2b8c1003ca92",
        "target": "08f16d6f-ef7f-4187-b2f5-32f482a11978"
      },
      {
        "id": "eedfbb5f-4268-4fac-b5e1-764ddada694c",
        "source": "45f00e19-fb4a-46dc-8956-46c458b1ca49",
        "target": "9f8cdac6-b290-4b7f-9447-87a6df31b90c"
      },
      {
        "id": "126aa7d7-e865-4cd2-b073-dbd5ec2e315e",
        "source": "45f00e19-fb4a-46dc-8956-46c458b1ca49",
        "target": "ae374bc0-923d-42c3-a191-eebe25d13ebe"
      },
      {
        "id": "08ba7c6a-e6bd-4a03-8198-00ebcf92f0dd",
        "source": "2f00371f-d90d-4929-9f20-8641fa3b9dc2",
        "target": "4dbda383-87e2-4401-9ba9-fadf25a536fc"
      },
      {
        "id": "27db12ed-b4ff-4fcf-bafb-b8883762c362",
        "source": "ee49a68b-d295-43b7-b147-54d6c745fced",
        "target": "18bd94d3-e6b9-4d39-a570-5f662dfd8094"
      },
      {
        "id": "0460239b-405c-4a9c-ba0b-776fd42e76b7",
        "source": "ee49a68b-d295-43b7-b147-54d6c745fced",
        "target": "deaf111b-9600-4157-8406-6428364508a9"
      },
      {
        "id": "477135ce-8a58-4bf0-9638-02b6a9384c3b",
        "source": "12a0c0e2-b041-4cfc-bde9-8a09037cefc0",
        "target": "e7cac6cc-5b86-4ac3-bc8b-60f663281699"
      },
      {
        "id": "6fbc3525-d4c6-4a1d-9825-197a36fcb69d",
        "source": "18bd94d3-e6b9-4d39-a570-5f662dfd8094",
        "target": "12a0c0e2-b041-4cfc-bde9-8a09037cefc0"
      },
      {
        "id": "ea42d9df-25ef-4f33-b3db-ae02003ad7ed",
        "source": "deaf111b-9600-4157-8406-6428364508a9",
        "target": "12a0c0e2-b041-4cfc-bde9-8a09037cefc0"
      },
      {
        "id": "7049f4eb-2d96-4739-a062-19198ea10103",
        "source": "e7cac6cc-5b86-4ac3-bc8b-60f663281699",
        "target": "45f00e19-fb4a-46dc-8956-46c458b1ca49",
        "label": "Improve Ranking",
        "labelAnchor": {
          "t": 0.45667992850509376,
          "segmentIndex": 2,
          "segmentT": 0.4696111646605987
        },
        "waypoints": [
          {
            "x": 3492.1654452284383,
            "y": -89
          },
          {
            "x": 3492.1654452284383,
            "y": 46.29148629148627
          },
          {
            "x": 2804.716535433071,
            "y": 46.29148629148627
          },
          {
            "x": 2804.716535433071,
            "y": 239
          }
        ]
      },
      {
        "id": "2b7d1e4c-6043-473f-bc91-24377905511c",
        "source": "5a2c05ee-8687-42c7-a190-5b59cbf6d93e",
        "target": "f3bf19d1-fbb8-4207-a8be-d1b80fcbbb9c",
        "waypoints": [
          {
            "x": 2200.5873015873017,
            "y": -89
          },
          {
            "x": 2200.5873015873017,
            "y": 3.9999999999999574
          },
          {
            "x": 1528,
            "y": 3.9999999999999574
          },
          {
            "x": 1528,
            "y": 253
          }
        ]
      },
      {
        "id": "81bc44bb-2158-434b-bbd8-75d7ec416b1e",
        "source": "4dbda383-87e2-4401-9ba9-fadf25a536fc",
        "target": "6981f9a7-cc4b-46ed-b0f3-6acb55bab7c9",
        "waypoints": [
          {
            "x": 3594,
            "y": 475
          },
          {
            "x": 3594,
            "y": -491.5557146265812
          },
          {
            "x": 2446.1683539557557,
            "y": -491.5557146265812
          },
          {
            "x": 2446.1683539557557,
            "y": -304
          }
        ]
      },
      {
        "id": "baede3fd-7f7f-4133-bba9-bb4334a39705",
        "source": "2bc93a6b-3dbb-4c1f-8b6b-7373c8c6cdf0",
        "target": "30f608ef-4aba-47bf-884f-549436dd5926",
        "waypoints": [
          {
            "x": 2024.0086753420085,
            "y": 456
          },
          {
            "x": 2024.0086753420085,
            "y": 238
          }
        ]
      },
      {
        "id": "52537ebf-1552-421b-b9db-5604dfea6574",
        "source": "4020f339-3ffa-4f2e-9fbf-ee174913edf8",
        "target": "30f608ef-4aba-47bf-884f-549436dd5926",
        "waypoints": [
          {
            "x": 1943.6032699366033,
            "y": 560
          },
          {
            "x": 1943.6032699366033,
            "y": 238
          }
        ]
      },
      {
        "id": "a505d8d0-50c2-4466-a29e-fea7391adefd",
        "source": "2bc93a6b-3dbb-4c1f-8b6b-7373c8c6cdf0",
        "target": "6b01b9c0-814f-4f8d-8e14-8e6c29e32a27",
        "waypoints": [
          {
            "x": 2024.008675342009,
            "y": 456
          },
          {
            "x": 2024.008675342009,
            "y": 680
          },
          {
            "x": 1659.4324324324325,
            "y": 680
          },
          {
            "x": 1659.4324324324325,
            "y": 815
          }
        ]
      },
      {
        "id": "b2e6bd5a-3cbe-4091-a651-29e9d14ce53e",
        "source": "4020f339-3ffa-4f2e-9fbf-ee174913edf8",
        "target": "6b01b9c0-814f-4f8d-8e14-8e6c29e32a27",
        "label": "When trigger candidate",
        "labelAnchor": {
          "t": 0.15739225989886385,
          "segmentIndex": 1,
          "segmentT": 0.6361270504245747
        },
        "waypoints": [
          {
            "x": 1942.9275942609274,
            "y": 560
          },
          {
            "x": 1942.9275942609274,
            "y": 680
          },
          {
            "x": 1659.4324324324325,
            "y": 680
          },
          {
            "x": 1659.4324324324325,
            "y": 815
          }
        ]
      },
      {
        "id": "b2fcb088-5657-4376-8974-040051ac40b8",
        "source": "22f1db56-f04d-475e-8bd2-f2acae5aa5c1",
        "target": "c42ea785-fda1-4337-a362-2b8c1003ca92"
      },
      {
        "id": "6448b9c4-92cd-45af-99f1-d2bfdc21c963",
        "source": "70df28ac-a943-47aa-97bc-98de591c8fc3",
        "target": "c42ea785-fda1-4337-a362-2b8c1003ca92",
        "waypoints": [
          {
            "x": 2461.608924320434,
            "y": 787
          },
          {
            "x": 2461.608924320434,
            "y": 490
          },
          {
            "x": 2460.4484304932735,
            "y": 490
          },
          {
            "x": 2460.4484304932735,
            "y": 238
          }
        ]
      },
      {
        "id": "117bed54-69a7-4637-a1be-ee953e844ae3",
        "source": "de9a27fd-0b1d-4f95-b55b-62393af3f360",
        "target": "c42ea785-fda1-4337-a362-2b8c1003ca92",
        "waypoints": [
          {
            "x": 2461.3764048054036,
            "y": 898
          },
          {
            "x": 2461.3764048054036,
            "y": 490
          },
          {
            "x": 2460,
            "y": 490
          },
          {
            "x": 2460,
            "y": 238
          }
        ]
      },
      {
        "id": "a3b6fb64-3c6f-4beb-a6e0-3628d8fec11d",
        "source": "08f16d6f-ef7f-4187-b2f5-32f482a11978",
        "target": "45f00e19-fb4a-46dc-8956-46c458b1ca49"
      },
      {
        "id": "33684fe9-3eb0-429a-82ba-9be77860c079",
        "source": "ae374bc0-923d-42c3-a191-eebe25d13ebe",
        "target": "2f00371f-d90d-4929-9f20-8641fa3b9dc2"
      },
      {
        "id": "e58c91b6-1757-4f8b-a5f1-b17dee3b566b",
        "source": "9f8cdac6-b290-4b7f-9447-87a6df31b90c",
        "target": "2f00371f-d90d-4929-9f20-8641fa3b9dc2"
      }
    ],
    "personas": [
      {
        "id": "176f2018-c87a-4efe-8cc9-6c878c594c8f",
        "name": "Primary App User",
        "role": "Works in the main app; optionally engages with sidecar suggestions.",
        "color": "#3B82F6",
        "category": "human",
        "initials": "PA"
      }
    ]
  },
  {
    "id": "tmpl_chat",
    "name": "Generative Chat Assistant",
    "description": "The core architecture of modern LLM chatbots like ChatGPT and Claude. Features session history management, safety guardrails, and streaming response generation.",
    "primary_use_case": "General Purpose Assistant",
    "complexity": "Medium",
    "tags": [
      "Chat",
      "LLM",
      "Consumer",
      "GenAI"
    ],
    "common_variations": [
      "RAG Chatbot",
      "Persona Bot"
    ],
     "nodes": [
    {
      "id": "974e1554-33bd-4a23-a473-9cd3b206642a",
      "referenceId": "tp_chat",
      "type": "touchpoint",
      "x": 401.0607699423612,
      "y": 778.850850352238,
      "customLabel": "Chat UI",
      "notes": "Primary conversational interface (web/mobile).",
      "measuredW": 180,
      "measuredH": 87,
      "personaId": "persona-user"
    },
    {
      "id": "4286105e-e5ed-41e7-bc75-fb1c24499884",
      "referenceId": "human_type_input",
      "type": "task",
      "x": 650.5270049099837,
      "y": 784.1792499822102,
      "customLabel": "Send Message",
      "notes": "User submits a message/prompt.",
      "attachments": [
        {
          "id": "chat-2-b",
          "referenceId": "const_user_consent",
          "type": "constraint",
          "notes": "User consent for processing message"
        }
      ],
      "measuredW": 280,
      "measuredH": 191,
      "personaId": "persona-user"
    },
    {
      "id": "830f95b0-4377-496d-82c3-09b479b42281",
      "referenceId": "system_session",
      "type": "task",
      "x": 1076.8550724637682,
      "y": 755.8347358578769,
      "customLabel": "Load Session",
      "notes": "Identify session + user context (account, settings).",
      "attachments": [
        {
          "id": "chat-3-b",
          "referenceId": "const_authentication",
          "type": "constraint",
          "notes": "User must be authenticated for saved sessions"
        }
      ],
      "measuredW": 280,
      "measuredH": 245
    },
    {
      "id": "08b1982b-abbf-4fc8-9b09-1188f06d9d63",
      "referenceId": "system_read_db",
      "type": "task",
      "x": 1453.6142460684555,
      "y": 781.6864164005842,
      "customLabel": "Load Conversation History",
      "notes": "Fetch recent messages and relevant memory for context.",
      "attachments": [
        {
          "id": "chat-4-b",
          "referenceId": "const_data_retention",
          "type": "constraint",
          "notes": "Only retain history per policy / user settings"
        },
        {
          "id": "chat-4-c",
          "referenceId": "const_privacy",
          "type": "constraint",
          "notes": "PII handling and privacy controls"
        }
      ],
      "measuredW": 280,
      "measuredH": 199
    },
    {
      "id": "db810962-1e6a-4644-8711-d566ecce4605",
      "referenceId": "system_format",
      "type": "task",
      "x": 1811.0576626580328,
      "y": 762.0604527866465,
      "customLabel": "Assemble Prompt",
      "notes": "Compose system instruction + history + user message into model input.",
      "attachments": [
        {
          "id": "chat-5-b",
          "referenceId": "const_system_instruction",
          "type": "constraint",
          "notes": "System policies + assistant behavior"
        },
        {
          "id": "chat-5-c",
          "referenceId": "const_context_window",
          "type": "constraint",
          "notes": "Summarize/trim to fit context window"
        }
      ],
      "measuredW": 280,
      "measuredH": 245
    },
    {
      "id": "8ccf35a3-eff5-48cc-9dc0-2dc35a8c4c3e",
      "referenceId": "system_rules",
      "type": "task",
      "x": 2223.81868640148,
      "y": 777.6339958023725,
      "customLabel": "Safety Guardrails",
      "notes": "Policy checks + refusal/redirect logic (pre-gen).",
      "attachments": [
        {
          "id": "chat-6-a",
          "referenceId": "const_content_safety",
          "type": "constraint",
          "notes": "Refuse disallowed requests; apply safe completion rules"
        },
        {
          "id": "chat-6-b",
          "referenceId": "const_audit_log",
          "type": "constraint",
          "notes": "Record moderation outcome + request class"
        }
      ],
      "measuredW": 280,
      "measuredH": 189
    },
    {
      "id": "9cfdf246-b24a-498a-8e2d-053212495386",
      "referenceId": "task_generate",
      "type": "task",
      "x": 2683.731823235367,
      "y": 750.8196292202917,
      "customLabel": "Generate Response (Streaming)",
      "notes": "LLM generates tokens; stream partial output as it’s produced.",
      "attachments": [
        {
          "id": "chat-7-b",
          "referenceId": "const_streaming",
          "type": "constraint",
          "notes": "Stream tokens to UI with partial renders"
        },
        {
          "id": "chat-7-c",
          "referenceId": "const_latency",
          "type": "constraint",
          "notes": "Time-to-first-token targets"
        }
      ],
      "measuredW": 280,
      "measuredH": 189
    },
    {
      "id": "fbbdad92-8949-4881-bbc5-40fe9dc853a3",
      "referenceId": "system_log",
      "type": "task",
      "x": 2725.730589809527,
      "y": 1135.3641867287715,
      "customLabel": "Persist Turn",
      "notes": "Store user message + assistant output; update summaries/memory as needed.",
      "attachments": [
        {
          "id": "chat-8-b",
          "referenceId": "const_encryption",
          "type": "constraint",
          "notes": "Encrypt stored conversation data"
        },
        {
          "id": "chat-8-c",
          "referenceId": "const_data_retention",
          "type": "constraint",
          "notes": "Retention window + deletion rules"
        }
      ],
      "measuredW": 280,
      "measuredH": 230
    },
    {
      "id": "d1f51346-1045-41c5-8522-281ba485f18d",
      "referenceId": "tp_chat",
      "type": "touchpoint",
      "x": 3161.5666454241455,
      "y": 776.3660506745373,
      "customLabel": "Stream to UI",
      "notes": "Render partial tokens; finalize response on completion.",
      "measuredW": 180,
      "measuredH": 139,
      "personaId": "persona-user"
    },
    {
      "id": "8c03ff2f-057a-4171-bcf8-a496c3a2028d",
      "referenceId": "zone_group",
      "type": "annotation",
      "subType": "zone",
      "x": 1020.5507246376811,
      "y": 714.5,
      "width": 1514.871794871795,
      "height": 475.29059829059827,
      "customLabel": "Core Chat Assistant Pipeline",
      "notes": "Session → History → Prompt → Guardrails → Streaming generation → Persist",
      "measuredW": 1515,
      "measuredH": 475
    },
    {
      "id": "d17b5e8d-cbf2-44c0-92c1-dc5a1ff729cc",
      "referenceId": "zone_group",
      "type": "annotation",
      "subType": "note",
      "x": 330.6471095772208,
      "y": 526.420621225194,
      "width": 560,
      "height": 110,
      "customLabel": "Minimal Pattern: Generative Chat Assistant",
      "notes": "Smallest useful architecture for modern LLM chat: session/history management, safety checks, streaming generation, and persistence.",
      "measuredW": 560,
      "measuredH": 110
    },
    {
      "id": "b3b6a227-40cc-4cf6-8ef0-6bd2b6e09546",
      "type": "data",
      "referenceId": "data_text",
      "x": 747.4557745677081,
      "y": 1046.8452999359567,
      "notes": "User message",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "b5da5e6e-cfeb-4365-9654-0356ec637352",
      "type": "data",
      "referenceId": "data_state_vector",
      "x": 1177.835646006784,
      "y": 1050.9707210567667,
      "notes": "Session state (IDs, preferences, feature flags)",
      "measuredW": 200,
      "measuredH": 93
    },
    {
      "id": "999cafa4-22e2-42cd-b6c9-ffb96b832de5",
      "type": "data",
      "referenceId": "data_session_history",
      "x": 1558.77304964539,
      "y": 1061.885614673788,
      "notes": "Prior turns (trimmed or summarized)",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "93ae8c52-8d67-4505-8b07-9f6d81a58ebe",
      "type": "data",
      "referenceId": "data_conversation",
      "x": 1899.5683009559052,
      "y": 1052.6136442760082,
      "notes": "Model-ready conversation payload",
      "measuredW": 200,
      "measuredH": 98
    },
    {
      "id": "94824f82-ed86-45f8-8039-63b58178a70b",
      "type": "data",
      "referenceId": "data_text",
      "x": 2784.6753940031745,
      "y": 997.7317476291726,
      "notes": "Assistant response text",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "ea0387aa-6226-415f-8443-07e498d87611",
      "type": "data",
      "referenceId": "data_log",
      "x": 2827.4327174691016,
      "y": 1396.002484601112,
      "notes": "Conversation record + timestamps",
      "measuredW": 200,
      "measuredH": 98,
      "customLabel": "Next turn uses updated history"
    },
    {
      "id": "a6cdfe55-4cda-4a11-b723-8afb1aa1f8a0",
      "referenceId": "zone_group",
      "type": "annotation",
      "x": 2560.3649757606763,
      "y": 715.918099850027,
      "subType": "zone",
      "width": 840.5797101449282,
      "height": 847.8260869565227,
      "measuredW": 839,
      "measuredH": 849,
      "customLabel": "Response generation and persistance"
    },
    {
      "id": "6073ab60-e89b-4064-ba88-40311f7510a0",
      "referenceId": "zone_group",
      "type": "annotation",
      "x": 351.44773788303894,
      "y": 711.8272673592958,
      "subType": "zone",
      "width": 646.1538461538464,
      "height": 476.9230769230771,
      "measuredW": 646,
      "measuredH": 477,
      "customLabel": "User Input"
    }
  ],
  "edges": [
    {
      "id": "67b63eb2-8a2e-47df-b783-e047f1787200",
      "source": "974e1554-33bd-4a23-a473-9cd3b206642a",
      "target": "4286105e-e5ed-41e7-bc75-fb1c24499884"
    },
    {
      "id": "725ba0bd-7852-404f-a212-9772e3435d9f",
      "source": "8ccf35a3-eff5-48cc-9dc0-2dc35a8c4c3e",
      "target": "9cfdf246-b24a-498a-8e2d-053212495386",
      "label": "Allowed",
      "waypoints": [
        {
          "x": 2513.8186864014806,
          "y": 744.5701660151385
        },
        {
          "x": 2513.8186864014806,
          "y": 844.5701660151385
        },
        {
          "x": 2641.731823235367,
          "y": 844.5701660151385
        },
        {
          "x": 2641.731823235367,
          "y": 954.5701660151385
        }
      ]
    },
    {
      "id": "c704b8b0-f194-45df-90c1-ca156c38cb9b",
      "source": "d1f51346-1045-41c5-8522-281ba485f18d",
      "target": "974e1554-33bd-4a23-a473-9cd3b206642a",
      "waypoints": [
        {
          "x": 3351.5666454241455,
          "y": 810
        },
        {
          "x": 3351.5666454241455,
          "y": 672.7459016393442
        },
        {
          "x": 327.62598733366553,
          "y": 672.7459016393442
        },
        {
          "x": 327.62598733366553,
          "y": 928
        }
      ]
    },
    {
      "id": "dec7141d-549e-4a1d-8840-f311daaec2ab",
      "source": "4286105e-e5ed-41e7-bc75-fb1c24499884",
      "target": "b3b6a227-40cc-4cf6-8ef0-6bd2b6e09546"
    },
    {
      "id": "882b9c56-25cd-4bfb-9f38-8dfd6833c20d",
      "source": "830f95b0-4377-496d-82c3-09b479b42281",
      "target": "b5da5e6e-cfeb-4365-9654-0356ec637352"
    },
    {
      "id": "e7e77c52-f5c8-4a3d-9385-3860f377c2c3",
      "source": "08b1982b-abbf-4fc8-9b09-1188f06d9d63",
      "target": "999cafa4-22e2-42cd-b6c9-ffb96b832de5"
    },
    {
      "id": "559a8795-cb76-49f6-95f3-eeffcd12ce5f",
      "source": "db810962-1e6a-4644-8711-d566ecce4605",
      "target": "93ae8c52-8d67-4505-8b07-9f6d81a58ebe"
    },
    {
      "id": "8486f11f-0964-48cd-8404-326b21f0954c",
      "source": "9cfdf246-b24a-498a-8e2d-053212495386",
      "target": "94824f82-ed86-45f8-8039-63b58178a70b"
    },
    {
      "id": "38323b45-9cd3-49e3-8cfc-921253fa1090",
      "source": "fbbdad92-8949-4881-bbc5-40fe9dc853a3",
      "target": "ea0387aa-6226-415f-8443-07e498d87611"
    },
    {
      "id": "fec24293-d467-4a90-b859-054f345927b6",
      "source": "b3b6a227-40cc-4cf6-8ef0-6bd2b6e09546",
      "target": "830f95b0-4377-496d-82c3-09b479b42281"
    },
    {
      "id": "68f72cc3-a26e-44d9-bfee-9ebf39707b5f",
      "source": "999cafa4-22e2-42cd-b6c9-ffb96b832de5",
      "target": "db810962-1e6a-4644-8711-d566ecce4605"
    },
    {
      "id": "237e54cd-735e-4b3b-ae90-f3c6529e2efd",
      "source": "b5da5e6e-cfeb-4365-9654-0356ec637352",
      "target": "08b1982b-abbf-4fc8-9b09-1188f06d9d63"
    },
    {
      "id": "55d955f0-87f9-416e-b81e-e35d883ae641",
      "source": "ea0387aa-6226-415f-8443-07e498d87611",
      "target": "08b1982b-abbf-4fc8-9b09-1188f06d9d63",
      "waypoints": [
        {
          "x": 3047,
          "y": 1445
        },
        {
          "x": 3047,
          "y": 1527.826086956522
        },
        {
          "x": 1434,
          "y": 1527.826086956522
        },
        {
          "x": 1434,
          "y": 881
        }
      ]
    },
    {
      "id": "7b58f0cc-ee5b-48f5-9b9a-741ff114bead",
      "source": "93ae8c52-8d67-4505-8b07-9f6d81a58ebe",
      "target": "8ccf35a3-eff5-48cc-9dc0-2dc35a8c4c3e",
      "label": "Policy pre-check",
      "waypoints": [
        {
          "x": 2165.4144310823312,
          "y": 1101.9434315100507
        },
        {
          "x": 2165.4144310823312,
          "y": 759.9434315100507
        }
      ],
      "labelAnchor": {
        "t": 0.8102186219012294,
        "segmentIndex": 1,
        "segmentT": 0.8102186219012294
      }
    },
    {
      "id": "167fc45e-510e-4c54-9f31-cce0d891bd8f",
      "source": "94824f82-ed86-45f8-8039-63b58178a70b",
      "target": "d1f51346-1045-41c5-8522-281ba485f18d",
      "label": "Stream tokens",
      "labelAnchor": {
        "t": 0.585101780643496,
        "segmentIndex": 1,
        "segmentT": 0.585101780643496
      },
      "waypoints": [
        {
          "x": 3043.4225601152593,
          "y": 1036.907664989641
        },
        {
          "x": 3043.4225601152593,
          "y": 969.907664989641
        }
      ]
    },
    {
      "id": "d08ef4a6-c5d5-4a14-89ae-d42ff50c62ae",
      "source": "94824f82-ed86-45f8-8039-63b58178a70b",
      "target": "fbbdad92-8949-4881-bbc5-40fe9dc853a3",
      "label": "Finalize + store",
      "waypoints": [
        {
          "x": 3042.0219544479437,
          "y": 1036.907664989641
        },
        {
          "x": 3042.0219544479437,
          "y": 1117.907664989641
        },
        {
          "x": 2706.211009174312,
          "y": 1117.907664989641
        },
        {
          "x": 2706.211009174312,
          "y": 1249.907664989641
        }
      ],
      "labelAnchor": {
        "t": 0.0755872645187916,
        "segmentIndex": 1,
        "segmentT": 0.5121372603852599
      }
    }
  ],
  "personas": [
    {
      "id": "persona-user",
      "name": "Chat User",
      "role": "Converses with assistant, receives streamed responses",
      "color": "#3B82F6",
      "initials": "CU",
      "category": "human"
    }
  ]
  },
  {
    "id": "tmpl_rag_basic",
    "name": "RAG Knowledge Base",
    "description": "The standard Retrieval-Augmented Generation pattern. It retrieves relevant context from a database before generating an answer, reducing hallucinations.",
    "primary_use_case": "Customer Support Chatbot, Internal Wiki Search",
    "complexity": "Medium",
    "tags": [
      "Search",
      "Text",
      "Chat"
    ],
    "common_variations": [
      "Hybrid Search (Keyword + Vector)",
      "Multi-Query RAG"
    ],
    "nodes": [
    {
      "id": "a57c7988-6b0e-4395-a627-f1598cf456b4",
      "referenceId": "tp_chat",
      "type": "touchpoint",
      "x": 94.78320609054539,
      "y": 827.5334787536622,
      "customLabel": "Chat / Help UI",
      "notes": "Where the user asks questions and receives answers.",
      "measuredW": 180,
      "measuredH": 87,
      "personaId": "persona-user"
    },
    {
      "id": "899d8530-4aae-4e81-9741-c2b73ea9d1e9",
      "referenceId": "human_type_input",
      "type": "task",
      "x": 353.5943949017342,
      "y": 779.7945510147345,
      "customLabel": "Ask a Question",
      "notes": "User submits a question to the knowledge base.",
      "attachments": [
        {
          "id": "rag-2-b",
          "referenceId": "const_user_consent",
          "type": "constraint",
          "notes": "User agrees to send query to retrieval + generation system"
        }
      ],
      "measuredW": 280,
      "measuredH": 191,
      "personaId": "persona-user"
    },
    {
      "id": "ad94ef65-dffa-4521-801f-e5d59d529f29",
      "referenceId": "task_represent",
      "type": "task",
      "x": 746.8949894382839,
      "y": 774.624440226646,
      "customLabel": "Represent Query (Embed)",
      "notes": "Convert question into an embedding for semantic retrieval.",
      "attachments": [
        {
          "id": "rag-3-b",
          "referenceId": "const_latency",
          "type": "constraint",
          "notes": "Keep retrieval prep fast (e.g., < 300ms target)"
        }
      ],
      "measuredW": 280,
      "measuredH": 245
    },
    {
      "id": "f80e72a1-9c43-4707-a78c-936e953ef279",
      "referenceId": "system_read_db",
      "type": "task",
      "x": 784.1530497300524,
      "y": 1346.2941188626166,
      "customLabel": "Load Knowledge Index",
      "notes": "Load vector index + document store metadata (scoped to user/org).",
      "attachments": [
        {
          "id": "rag-4-b",
          "referenceId": "const_authorization",
          "type": "constraint",
          "notes": "Only retrieve documents user is allowed to access"
        },
        {
          "id": "rag-4-c",
          "referenceId": "const_data_residency",
          "type": "constraint",
          "notes": "Respect org data residency requirements"
        }
      ],
      "measuredW": 280,
      "measuredH": 157
    },
    {
      "id": "a5b9f8ed-0ab5-46c9-b274-6f0420d15460",
      "referenceId": "task_retrieve",
      "type": "task",
      "x": 1149.6222621655568,
      "y": 775.0440206462266,
      "customLabel": "Retrieve Relevant Context",
      "notes": "Top-k semantic retrieval (optionally hybrid with keywords).",
      "attachments": [
        {
          "id": "rag-5-c",
          "referenceId": "const_context_window",
          "type": "constraint",
          "notes": "Limit retrieved context to fit model context window"
        }
      ],
      "measuredW": 280,
      "measuredH": 245
    },
    {
      "id": "627b4081-257d-4214-a544-cbaa927c5fc6",
      "referenceId": "task_generate",
      "type": "task",
      "x": 1574.843707387002,
      "y": 780.6384262406323,
      "customLabel": "Generate Answer (Grounded)",
      "notes": "Answer using retrieved context; avoid inventing unsupported facts.",
      "attachments": [
        {
          "id": "rag-6-b",
          "referenceId": "const_system_instruction",
          "type": "constraint",
          "notes": "Use provided context; if missing, say what’s missing"
        },
        {
          "id": "rag-6-c",
          "referenceId": "const_tone",
          "type": "constraint",
          "notes": "Match product tone (helpful, concise)"
        }
      ],
      "measuredW": 280,
      "measuredH": 230
    },
    {
      "id": "dc8bf704-f954-42fc-b3b7-85d36332eff5",
      "referenceId": "system_rules",
      "type": "task",
      "x": 1954.529506301962,
      "y": 794.433245653429,
      "customLabel": "Grounding + Confidence Gate",
      "notes": "Decide whether to answer, ask a clarifying question, or cite limits.",
      "attachments": [
        {
          "id": "rag-7-a",
          "referenceId": "const_confidence",
          "type": "constraint",
          "notes": "If low confidence, respond with uncertainty + what to retrieve next"
        },
        {
          "id": "rag-7-b",
          "referenceId": "const_audit_log",
          "type": "constraint",
          "notes": "Log retrieval doc IDs + model version for traceability"
        },
        {
          "id": "rag-7-c",
          "referenceId": "const_content_safety",
          "type": "constraint",
          "notes": "Apply safety policies to generated output"
        }
      ],
      "measuredW": 280,
      "measuredH": 212
    },
    {
      "id": "3b707d7f-ade2-46c5-b0c8-65452276490c",
      "referenceId": "tp_chat",
      "type": "touchpoint",
      "x": 2386.2438358510512,
      "y": 856.1951936322621,
      "customLabel": "Answer in UI",
      "notes": "Show answer with optional citations to retrieved sources.",
      "measuredW": 180,
      "measuredH": 87,
      "personaId": "persona-user"
    },
    {
      "id": "143fff96-ee80-4da2-95a9-9bc695ee746f",
      "referenceId": "zone_group",
      "type": "annotation",
      "subType": "note",
      "x": 34.51774635292949,
      "y": 538.80175190715,
      "width": 520,
      "height": 110,
      "customLabel": "Core Pattern: RAG Knowledge Base",
      "notes": "Minimal template: user question → embed → retrieve context → grounded generation → gate → answer.",
      "measuredW": 520,
      "measuredH": 110
    },
    {
      "id": "2ab192e6-77cd-486e-b3f8-d5fd6903cc20",
      "type": "data",
      "referenceId": "data_text",
      "x": 444.7598960672355,
      "y": 1052.307371527555,
      "notes": "User question",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "4141af3c-0c58-4ee0-bcf9-12ce4c338248",
      "type": "data",
      "referenceId": "data_embedding",
      "x": 847.2213297646242,
      "y": 1052.9647665669725,
      "notes": "Query embedding vector",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "ab7f8204-a9f6-496d-9a3f-8c56f385d219",
      "type": "data",
      "referenceId": "data_knowledge_graph",
      "x": 885.8874202284676,
      "y": 1535.6320618185377,
      "notes": "KB structure (docs/collections/links) or retrieval index metadata",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "d58924a1-1692-4b05-8352-640df1194735",
      "type": "data",
      "referenceId": "data_list",
      "x": 1247.6176001608944,
      "y": 1052.5545101567163,
      "notes": "Top retrieved chunks/doc IDs",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "eba79278-f173-4910-932c-df66ecb7a1c3",
      "type": "data",
      "referenceId": "data_document",
      "x": 1247.9905605338547,
      "y": 1142.7689623711685,
      "notes": "Retrieved text chunks with citations/metadata",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "6313c62e-cbcf-4f2d-ab95-8ece3f255b85",
      "type": "data",
      "referenceId": "data_text",
      "x": 1677.897320440615,
      "y": 1042.461270063476,
      "notes": "Draft answer",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "2315557e-787d-4c61-a80a-05f0d47c7c69",
      "referenceId": "zone_group",
      "type": "annotation",
      "x": 58.094191588691594,
      "y": 742.3053381282826,
      "subType": "zone",
      "width": 635.9550561797753,
      "height": 513.4831460674158,
      "measuredW": 636,
      "measuredH": 515,
      "customLabel": "User Input"
    },
    {
      "id": "e20cfcd9-9d2b-4556-9538-c047c88efc44",
      "referenceId": "zone_group",
      "type": "annotation",
      "x": 716.5211578808265,
      "y": 741.1817426226648,
      "subType": "zone",
      "width": 1204.494382022472,
      "height": 515.7303370786515,
      "measuredW": 1204,
      "measuredH": 517,
      "customLabel": "Core RAG Pipeline"
    },
    {
      "id": "eb3933ae-a760-4cae-9b87-38d1954c1c32",
      "referenceId": "zone_group",
      "type": "annotation",
      "x": 722.7009331617255,
      "y": 1285.001967341766,
      "subType": "zone",
      "width": 423.5955056179776,
      "height": 366.29213483146066,
      "measuredW": 422,
      "measuredH": 366,
      "semanticType": "data",
      "customLabel": "Reference Data"
    },
    {
      "id": "56a1649e-8533-4825-a87a-37a736497ab0",
      "referenceId": "zone_group",
      "type": "annotation",
      "x": 1938.7252341807994,
      "y": 741.8872560796806,
      "subType": "zone",
      "width": 669.7674418604652,
      "height": 517.4418604651164,
      "measuredW": 672,
      "measuredH": 517,
      "customLabel": "GATE: Present to User"
    }
  ],
  "edges": [
    {
      "id": "f5f58dff-262f-4370-abfe-601412237c64",
      "source": "a57c7988-6b0e-4395-a627-f1598cf456b4",
      "target": "899d8530-4aae-4e81-9741-c2b73ea9d1e9"
    },
    {
      "id": "96079644-f90d-4cdc-9fa0-cfbb87d46345",
      "source": "dc8bf704-f954-42fc-b3b7-85d36332eff5",
      "target": "3b707d7f-ade2-46c5-b0c8-65452276490c",
      "label": "If answerable"
    },
    {
      "id": "9f736586-1ea4-45aa-a9d0-928466b45004",
      "source": "899d8530-4aae-4e81-9741-c2b73ea9d1e9",
      "target": "2ab192e6-77cd-486e-b3f8-d5fd6903cc20"
    },
    {
      "id": "97162f74-fb68-48a2-ac99-ab60fdc1603b",
      "source": "ad94ef65-dffa-4521-801f-e5d59d529f29",
      "target": "4141af3c-0c58-4ee0-bcf9-12ce4c338248"
    },
    {
      "id": "c849d2ae-39a4-4857-a26f-f0ea97397d11",
      "source": "f80e72a1-9c43-4707-a78c-936e953ef279",
      "target": "ab7f8204-a9f6-496d-9a3f-8c56f385d219"
    },
    {
      "id": "b2a38c32-ac7e-47f0-913b-f60418081639",
      "source": "a5b9f8ed-0ab5-46c9-b274-6f0420d15460",
      "target": "d58924a1-1692-4b05-8352-640df1194735"
    },
    {
      "id": "98a0b1ff-568a-4b61-a2bf-5e27a0987662",
      "source": "a5b9f8ed-0ab5-46c9-b274-6f0420d15460",
      "target": "eba79278-f173-4910-932c-df66ecb7a1c3"
    },
    {
      "id": "8372dd53-4231-4c67-82c5-bd6345f69d23",
      "source": "627b4081-257d-4214-a544-cbaa927c5fc6",
      "target": "6313c62e-cbcf-4f2d-ab95-8ece3f255b85"
    },
    {
      "id": "d8c04289-687c-42ee-8006-b2f952556084",
      "source": "2ab192e6-77cd-486e-b3f8-d5fd6903cc20",
      "target": "ad94ef65-dffa-4521-801f-e5d59d529f29"
    },
    {
      "id": "c52a50ca-7c5e-4780-ba7d-d617c9408a2e",
      "source": "4141af3c-0c58-4ee0-bcf9-12ce4c338248",
      "target": "a5b9f8ed-0ab5-46c9-b274-6f0420d15460"
    },
    {
      "id": "e7c3cec8-4b9a-4daf-b3a4-34e84b3989f5",
      "source": "ab7f8204-a9f6-496d-9a3f-8c56f385d219",
      "target": "a5b9f8ed-0ab5-46c9-b274-6f0420d15460"
    },
    {
      "id": "20852a5c-8e2f-41e0-b291-e6c51d33ed2e",
      "source": "d58924a1-1692-4b05-8352-640df1194735",
      "target": "627b4081-257d-4214-a544-cbaa927c5fc6"
    },
    {
      "id": "fa97c77f-cce8-4e38-8a1c-c46f515bdeda",
      "source": "eba79278-f173-4910-932c-df66ecb7a1c3",
      "target": "627b4081-257d-4214-a544-cbaa927c5fc6"
    },
    {
      "id": "e253ae79-a9ad-4d7a-9c23-9a455bf24717",
      "source": "6313c62e-cbcf-4f2d-ab95-8ece3f255b85",
      "target": "dc8bf704-f954-42fc-b3b7-85d36332eff5"
    },
    {
      "id": "a213ab86-fe6f-48ab-8f63-17a84e22b2bb",
      "source": "dc8bf704-f954-42fc-b3b7-85d36332eff5",
      "target": "a5b9f8ed-0ab5-46c9-b274-6f0420d15460",
      "waypoints": [
        {
          "x": 2257.162790697674,
          "y": 900
        },
        {
          "x": 2257.162790697674,
          "y": 701.7977528089887
        },
        {
          "x": 1107.5280898876404,
          "y": 701.7977528089887
        },
        {
          "x": 1107.5280898876404,
          "y": 898
        }
      ],
      "label": "If unclear",
      "labelAnchor": {
        "t": 0.08960743151640164,
        "segmentIndex": 1,
        "segmentT": 0.698587342434033
      }
    },
    {
      "id": "35cb4d17-eeee-4db1-80f2-08972fb1cb02",
      "source": "3b707d7f-ade2-46c5-b0c8-65452276490c",
      "target": "a57c7988-6b0e-4395-a627-f1598cf456b4",
      "waypoints": [
        {
          "x": 2585.8372093023254,
          "y": 900
        },
        {
          "x": 2585.8372093023254,
          "y": 672.5581395348836
        },
        {
          "x": 23.837209302325576,
          "y": 672.5581395348836
        },
        {
          "x": 23.837209302325576,
          "y": 871
        }
      ]
    }
  ],
  "personas": [
    {
      "id": "persona-user",
      "name": "Knowledge Base User",
      "role": "Asks questions, consumes grounded answers",
      "color": "#3B82F6",
      "initials": "KU",
      "category": "human"
    }
  ]
  },
  {
    "id": "tmpl_doc_extract",
    "name": "Document Extraction Pipeline",
    "description": "Automates the processing of uploaded files (PDFs, Images) into structured database records with a human-in-the-loop verification step.",
    "primary_use_case": "Invoice Processing, KYC, Application Forms",
    "complexity": "High",
    "tags": [
      "Vision",
      "Automation",
      "Operations"
    ],
    "common_variations": [
      "Batch Processing",
      "Auto-Reject Low Confidence"
    ],
    "nodes": [
    {
      "id": "24da5ecc-1ddb-4730-89e3-3e612cf00f14",
      "referenceId": "human_upload_file",
      "type": "task",
      "x": 1401.320241873629,
      "y": 256.74713116625384,
      "customLabel": "Upload Document",
      "notes": "Upload PDF(s) / image(s) to be processed.",
      "attachments": [
        {
          "id": "dex-2-b",
          "referenceId": "const_user_consent",
          "type": "constraint",
          "notes": "User consents to processing + storage"
        },
        {
          "id": "dex-2-c",
          "referenceId": "const_privacy",
          "type": "constraint",
          "notes": "Sensitive docs handled under privacy policy"
        }
      ],
      "measuredW": 280,
      "measuredH": 191,
      "personaId": "persona-ops"
    },
    {
      "id": "24c7d8b7-ee3b-4346-aadc-9e98dcd3c993",
      "referenceId": "data_file",
      "type": "data",
      "x": 1498.8923595810254,
      "y": 498.8733350747556,
      "customLabel": "Source File(s)",
      "notes": "PDFs / images to be extracted.",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "7e25d263-caa5-4095-8ab6-7e00e27297ad",
      "referenceId": "system_orchestrate",
      "type": "task",
      "x": 1749.9932575032283,
      "y": 253.96594807108153,
      "customLabel": "Create Processing Job",
      "notes": "Open a session/job for extraction pipeline; route by file type.",
      "attachments": [
        {
          "id": "dex-3-b",
          "referenceId": "const_error_handling",
          "type": "constraint",
          "notes": "Retry + failure states for corrupt/unsupported files"
        },
        {
          "id": "dex-3-c",
          "referenceId": "const_audit_log",
          "type": "constraint",
          "notes": "Log file IDs, user, timestamps, model versions"
        }
      ],
      "measuredW": 280,
      "measuredH": 245
    },
    {
      "id": "7bb41ad0-f7f1-4ee4-9e5e-397112af9ab2",
      "referenceId": "task_extract",
      "type": "task",
      "x": 1080.307043223689,
      "y": 699.0614823459417,
      "customLabel": "Extract Text / Layout",
      "notes": "Parse PDF text or OCR images; preserve structure when possible.",
      "attachments": [
        {
          "id": "dex-4-b",
          "referenceId": "const_quality_threshold",
          "type": "constraint",
          "notes": "Minimum extraction quality; else flag for review"
        },
        {
          "id": "dex-4-c",
          "referenceId": "const_latency",
          "type": "constraint",
          "notes": "Batch/async allowed; keep UI responsive"
        }
      ],
      "measuredW": 280,
      "measuredH": 245
    },
    {
      "id": "610e59fc-67d7-4f4b-868b-f28b388b73f8",
      "referenceId": "data_document",
      "type": "data",
      "x": 1182.020567540811,
      "y": 994.5851332453421,
      "customLabel": "Extracted Text",
      "notes": "Text + layout blocks (and/or OCR output).",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "0587723d-2bb9-45da-8a73-45e6c72cd900",
      "referenceId": "task_transform",
      "type": "task",
      "x": 1450.6534789332163,
      "y": 690.3952598276205,
      "customLabel": "Normalize to Schema",
      "notes": "Convert extracted content into structured fields that match a target record schema.",
      "attachments": [
        {
          "id": "dex-5-c",
          "referenceId": "const_format",
          "type": "constraint",
          "notes": "Strict output formatting (types, required fields)"
        }
      ],
      "measuredW": 280,
      "measuredH": 230
    },
    {
      "id": "ca3392ad-b105-4d3c-be0e-177425d39aee",
      "referenceId": "data_structured_text",
      "type": "data",
      "x": 1549.4753919645655,
      "y": 992.0425730054284,
      "customLabel": "Proposed Fields",
      "notes": "Candidate structured fields extracted from the doc.",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "3969d866-339c-49e8-a6fc-866be6d4efb4",
      "referenceId": "task_verify",
      "type": "task",
      "x": 1805.1429304100097,
      "y": 680.9269053972408,
      "customLabel": "Auto-Verify + Confidence",
      "notes": "Assign confidence per field; decide if human review is required.",
      "attachments": [
        {
          "id": "dex-6-b",
          "referenceId": "const_confidence",
          "type": "constraint",
          "notes": "Route to human review under threshold"
        },
        {
          "id": "dex-6-c",
          "referenceId": "const_human_loop",
          "type": "constraint",
          "notes": "Human-in-the-loop required for low confidence or sensitive fields"
        }
      ],
      "measuredW": 280,
      "measuredH": 245
    },
    {
      "id": "957f6ae5-78a8-4754-a705-d9178dab754c",
      "referenceId": "data_score",
      "type": "data",
      "x": 1940.1809050935535,
      "y": 1006.4416733297303,
      "customLabel": "Field Confidence",
      "notes": "Score(s) used to route the workflow.",
      "measuredW": 200,
      "measuredH": 93
    },
    {
      "id": "83a2de8a-1b39-4ab9-9670-40697d5036ce",
      "referenceId": "human_review",
      "type": "task",
      "x": 2324.6622194553224,
      "y": 252.90451888788834,
      "customLabel": "Human Verification",
      "notes": "Reviewer checks extracted fields against the source and corrects errors.",
      "attachments": [
        {
          "id": "dex-7-b",
          "referenceId": "const_audit_log",
          "type": "constraint",
          "notes": "Record who approved what and when"
        },
        {
          "id": "dex-7-c",
          "referenceId": "const_authorization",
          "type": "constraint",
          "notes": "Only authorized reviewers can approve"
        }
      ],
      "measuredW": 280,
      "measuredH": 247,
      "personaId": "persona-reviewer"
    },
    {
      "id": "dc721b4e-d0ad-4b2a-8cf6-cb8e0d317026",
      "referenceId": "system_create_db",
      "type": "task",
      "x": 2780.9697582607264,
      "y": 276.49530705464457,
      "customLabel": "Write Record to DB",
      "notes": "Persist verified structured record.",
      "attachments": [
        {
          "id": "dex-8-b",
          "referenceId": "const_encryption",
          "type": "constraint",
          "notes": "Encrypt sensitive fields at rest"
        },
        {
          "id": "dex-8-c",
          "referenceId": "const_data_retention",
          "type": "constraint",
          "notes": "Retention policy for source files and extracted data"
        }
      ],
      "measuredW": 280,
      "measuredH": 199
    },
    {
      "id": "c16000d7-078e-4de5-b61a-12b069e88e5b",
      "referenceId": "data_db_record",
      "type": "data",
      "x": 2881.7712728182814,
      "y": 507.7632439508896,
      "customLabel": "DB Record",
      "notes": "Final structured record (verified).",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "71681135-9136-447f-b5af-dff3d6c633e1",
      "referenceId": "system_notification",
      "type": "task",
      "x": 3149.7944391541546,
      "y": 281.5286653219015,
      "customLabel": "Notify Completion",
      "notes": "Notify uploader (and/or downstream system) that the record is ready.",
      "measuredW": 280,
      "measuredH": 194
    },
    {
      "id": "18433f02-3d1d-46a3-8291-aa5a2a3aecb8",
      "referenceId": "zone_group",
      "type": "annotation",
      "subType": "zone",
      "x": 1053.9912537500052,
      "y": 660.6442049752999,
      "width": 1118.7016128366208,
      "height": 526.3888588736985,
      "customLabel": "Document Extraction Pipeline",
      "notes": "Upload → Extract → Normalize → Verify → Human review (if needed) → Save.",
      "measuredW": 1119,
      "measuredH": 526,
      "color": "bg-red-100/50 border-red-300"
    },
    {
      "id": "34a5652f-718e-46ed-a068-d63750472509",
      "referenceId": "zone_group",
      "type": "annotation",
      "subType": "note",
      "x": 1040.8854081247705,
      "y": 33.21116860958739,
      "width": 450.9890109890109,
      "height": 111.0989010989011,
      "customLabel": "Core Pattern: Document Extraction",
      "notes": "Minimal template for turning PDFs/images into structured DB records with a human verification step.",
      "measuredW": 451,
      "measuredH": 111
    },
    {
      "id": "02f433de-a942-41d1-ae60-a2951fe906fb",
      "referenceId": "zone_group",
      "type": "annotation",
      "x": 1059.6898734177214,
      "y": 202.06329113924045,
      "subType": "zone",
      "width": 1106.3291139240507,
      "height": 408.8607594936709,
      "measuredW": 1105,
      "measuredH": 411,
      "customLabel": "Upload",
      "color": "bg-blue-100/50 border-blue-300"
    },
    {
      "id": "9672e7bc-d3d5-4119-a051-dee938557b64",
      "referenceId": "tp_web",
      "type": "touchpoint",
      "x": 1123.7478749601833,
      "y": 245.08372565260177,
      "measuredW": 180,
      "measuredH": 137,
      "customLabel": "Upload UI"
    },
    {
      "id": "4d3f5bc8-0a53-4e61-b202-15f6619a8ad6",
      "referenceId": "zone_group",
      "type": "annotation",
      "x": 2277.842572514519,
      "y": 193.9943085614869,
      "subType": "zone",
      "width": 1210.526315789474,
      "height": 425,
      "measuredW": 1211,
      "measuredH": 425,
      "customLabel": "Review",
      "color": "bg-blue-100/50 border-blue-300"
    },
    {
      "id": "342bece6-554a-415e-8641-757b2580d985",
      "type": "data",
      "referenceId": "data_session_history",
      "x": 1830.3238360156247,
      "y": 523.1560307157096,
      "notes": "Job/session record",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "32b1bc5d-e131-4fa2-8ad5-97a6d71f588a",
      "type": "data",
      "referenceId": "data_schema",
      "x": 1553.6286855447865,
      "y": 1081.0068300755543,
      "notes": "Target schema definition (versioned)",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "dc0a65bd-5f7b-4e36-b49c-808a6362b630",
      "type": "data",
      "referenceId": "data_selection",
      "x": 2427.306847554496,
      "y": 529.532618061442,
      "notes": "Approved/corrected values",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "d83fee0e-7d9f-4123-bf82-01cc59b93aa8",
      "type": "data",
      "referenceId": "data_signal",
      "x": 3251.777910228535,
      "y": 513.7600702805792,
      "notes": "Completion signal",
      "measuredW": 200,
      "measuredH": 78
    }
  ],
  "edges": [
    {
      "id": "4746145e-6c10-45ba-8a2f-91b330401f3f",
      "source": "24da5ecc-1ddb-4730-89e3-3e612cf00f14",
      "target": "24c7d8b7-ee3b-4346-aadc-9e98dcd3c993"
    },
    {
      "id": "a75dc4ce-9411-4d23-a567-73b6ee704893",
      "source": "24c7d8b7-ee3b-4346-aadc-9e98dcd3c993",
      "target": "7e25d263-caa5-4095-8ab6-7e00e27297ad",
      "waypoints": [
        {
          "x": 1715.4342086774056,
          "y": 537.8733350747556
        },
        {
          "x": 1715.4342086774056,
          "y": 355.4659480710815
        }
      ]
    },
    {
      "id": "c8c1d370-6068-44d6-a350-ec67a71ab77b",
      "source": "7bb41ad0-f7f1-4ee4-9e5e-397112af9ab2",
      "target": "610e59fc-67d7-4f4b-868b-f28b388b73f8"
    },
    {
      "id": "eecf94b9-6edf-4efa-9dcf-e842aaecfa6f",
      "source": "610e59fc-67d7-4f4b-868b-f28b388b73f8",
      "target": "0587723d-2bb9-45da-8a73-45e6c72cd900",
      "waypoints": [
        {
          "x": 1416.3370232370137,
          "y": 1033.5851332453421
        },
        {
          "x": 1416.3370232370137,
          "y": 805.3952598276205
        }
      ]
    },
    {
      "id": "34eb1179-5898-4ea7-a342-3e338b3da279",
      "source": "0587723d-2bb9-45da-8a73-45e6c72cd900",
      "target": "ca3392ad-b105-4d3c-be0e-177425d39aee"
    },
    {
      "id": "00536322-d8f6-4461-ba70-b2242ffebdea",
      "source": "ca3392ad-b105-4d3c-be0e-177425d39aee",
      "target": "3969d866-339c-49e8-a6fc-866be6d4efb4",
      "waypoints": [
        {
          "x": 1774.8298223443123,
          "y": 1021.1252176335274
        },
        {
          "x": 1774.8298223443123,
          "y": 803.4269053972408
        }
      ]
    },
    {
      "id": "2c6ce46c-fcc6-4fd9-b3bd-3d84a2929ac6",
      "source": "3969d866-339c-49e8-a6fc-866be6d4efb4",
      "target": "957f6ae5-78a8-4754-a705-d9178dab754c"
    },
    {
      "id": "ddf7b88e-fdf6-434f-9c4c-858a77ce35c1",
      "source": "957f6ae5-78a8-4754-a705-d9178dab754c",
      "target": "83a2de8a-1b39-4ab9-9670-40697d5036ce",
      "label": "If below threshold",
      "targetX": 2302.6622194553224,
      "customY": 947.2602387305742,
      "sourceX": 2158.180905093554,
      "labelAnchor": {
        "t": 0.10362650548233741,
        "segmentIndex": 1,
        "segmentT": 0.10362650548233741
      },
      "waypoints": [
        {
          "x": 2240.3999205956056,
          "y": 1053
        },
        {
          "x": 2240.3999205956056,
          "y": 352
        }
      ]
    },
    {
      "id": "e3b6716f-0aee-4f60-84db-df88976635c6",
      "source": "dc721b4e-d0ad-4b2a-8cf6-cb8e0d317026",
      "target": "c16000d7-078e-4de5-b61a-12b069e88e5b"
    },
    {
      "id": "fe6a3cd5-f955-4ab2-a0d1-fec27acb6be5",
      "source": "c16000d7-078e-4de5-b61a-12b069e88e5b",
      "target": "71681135-9136-447f-b5af-dff3d6c633e1",
      "waypoints": [
        {
          "x": 3105.452277473821,
          "y": 540.9781199839474
        },
        {
          "x": 3105.452277473821,
          "y": 355.875772759918
        }
      ]
    },
    {
      "id": "93562b01-0e39-4485-857b-1c214983adf2",
      "source": "957f6ae5-78a8-4754-a705-d9178dab754c",
      "target": "dc721b4e-d0ad-4b2a-8cf6-cb8e0d317026",
      "customX": 2321.4762637433428,
      "label": "If above threshold",
      "waypoints": [
        {
          "x": 2271.3924050632913,
          "y": 1053
        },
        {
          "x": 2271.3924050632913,
          "y": 1053.5443037974685
        },
        {
          "x": 2734.00839855985,
          "y": 1053.5443037974685
        },
        {
          "x": 2734.00839855985,
          "y": 354
        }
      ],
      "labelAnchor": {
        "t": 0.051298057967626126,
        "segmentIndex": 2,
        "segmentT": 0.1120161262521099
      }
    },
    {
      "id": "2dc97187-e973-4d81-8c0d-704ca1fd2fa5",
      "source": "9672e7bc-d3d5-4119-a051-dee938557b64",
      "target": "24da5ecc-1ddb-4730-89e3-3e612cf00f14",
      "waypoints": [
        {
          "x": 1348.731182795699,
          "y": 288
        },
        {
          "x": 1348.731182795699,
          "y": 352
        }
      ]
    },
    {
      "id": "c87b2768-01e8-4d07-8e17-cb45f09894ac",
      "source": "9672e7bc-d3d5-4119-a051-dee938557b64",
      "target": "83a2de8a-1b39-4ab9-9670-40697d5036ce",
      "waypoints": [
        {
          "x": 1349.1397849462367,
          "y": 288
        },
        {
          "x": 1349.1397849462367,
          "y": 224.94623655913978
        },
        {
          "x": 2304.504997497743,
          "y": 224.94623655913978
        },
        {
          "x": 2304.504997497743,
          "y": 427
        }
      ]
    },
    {
      "id": "fcdbcc92-2c6b-47b8-baae-54ba105c1019",
      "source": "7e25d263-caa5-4095-8ab6-7e00e27297ad",
      "target": "342bece6-554a-415e-8641-757b2580d985"
    },
    {
      "id": "7a1ba2bb-fa8d-47cb-9510-173c3e81788e",
      "source": "0587723d-2bb9-45da-8a73-45e6c72cd900",
      "target": "32b1bc5d-e131-4fa2-8ad5-97a6d71f588a"
    },
    {
      "id": "897ed1d7-6056-4f9b-8c6c-95c507d76459",
      "source": "83a2de8a-1b39-4ab9-9670-40697d5036ce",
      "target": "dc0a65bd-5f7b-4e36-b49c-808a6362b630"
    },
    {
      "id": "7798a1b9-8e9e-4f41-9fd0-a4a0d74f58c3",
      "source": "71681135-9136-447f-b5af-dff3d6c633e1",
      "target": "d83fee0e-7d9f-4123-bf82-01cc59b93aa8"
    },
    {
      "id": "424dcd23-17f2-4750-8cb0-731e7752fe9b",
      "source": "342bece6-554a-415e-8641-757b2580d985",
      "target": "7bb41ad0-f7f1-4ee4-9e5e-397112af9ab2",
      "waypoints": [
        {
          "x": 2050,
          "y": 562
        },
        {
          "x": 2050,
          "y": 639.4214876033058
        },
        {
          "x": 1037.685950413223,
          "y": 639.4214876033058
        },
        {
          "x": 1037.685950413223,
          "y": 822
        }
      ]
    },
    {
      "id": "1d35b6de-a9dd-4b6d-9502-aa168d224a66",
      "source": "32b1bc5d-e131-4fa2-8ad5-97a6d71f588a",
      "target": "3969d866-339c-49e8-a6fc-866be6d4efb4"
    },
    {
      "id": "72d28fc9-d470-4b1c-8a0a-5f0cd795bdda",
      "source": "dc0a65bd-5f7b-4e36-b49c-808a6362b630",
      "target": "dc721b4e-d0ad-4b2a-8cf6-cb8e0d317026",
      "label": "After approval",
      "waypoints": [
        {
          "x": 2679.2314049586776,
          "y": 569
        },
        {
          "x": 2679.2314049586776,
          "y": 322
        }
      ]
    },
    {
      "id": "410a52b8-0dcc-43ab-a743-25ad13ed578d",
      "source": "d83fee0e-7d9f-4123-bf82-01cc59b93aa8",
      "target": "9672e7bc-d3d5-4119-a051-dee938557b64",
      "waypoints": [
        {
          "x": 3505.3333333333335,
          "y": 553
        },
        {
          "x": 3505.3333333333335,
          "y": 169.9999999999999
        },
        {
          "x": 1034.7692307692307,
          "y": 169.9999999999999
        },
        {
          "x": 1034.7692307692307,
          "y": 314
        }
      ]
    }
  ],
  "personas": [
    {
      "id": "persona-ops",
      "name": "Uploader",
      "role": "Submits documents for extraction",
      "color": "#3B82F6",
      "initials": "UP",
      "category": "human"
    },
    {
      "id": "persona-reviewer",
      "name": "Verifier",
      "role": "Checks and approves extracted fields",
      "color": "#10B981",
      "initials": "HV",
      "category": "human"
    }
  ]
  },
  {
    "id": "tmpl_agent_tool",
    "name": "Tool-Using Agent",
    "description": "An autonomous agent loop that can decide to call external APIs to fulfill a user request.",
    "primary_use_case": "Personal Assistant, Booking Bot, Data Analyst",
    "complexity": "High",
    "tags": [
      "Agentic",
      "Logic",
      "API"
    ],
    "common_variations": [
      "Multi-Agent Swarm",
      "Plan-and-Solve"
    ],
    "nodes": [
      {
        "id": "3efce7c8-f89e-4b2f-956b-b949a44fd9e5",
        "referenceId": "tp_chat",
        "type": "touchpoint",
        "x": -131.75171136623788,
        "y": 825.1289253636883,
        "customLabel": "Chat / Command UI",
        "notes": "User asks for something to be done; agent responds and may take actions via tools.",
        "measuredW": 180,
        "measuredH": 139,
        "personaId": "persona-user"
      },
      {
        "id": "35bb0c38-7496-416d-bc08-cb92fa7c2aaf",
        "referenceId": "human_type_input",
        "type": "task",
        "x": 154.6167096863938,
        "y": 783.234188521583,
        "customLabel": "User Request",
        "notes": "User expresses a goal (not steps).",
        "attachments": [
          {
            "id": "agent-2-b",
            "referenceId": "const_user_consent",
            "type": "constraint",
            "notes": "User consents to tool calls on their behalf (scope may be limited)"
          }
        ],
        "measuredW": 280,
        "measuredH": 191,
        "personaId": "persona-user"
      },
      {
        "id": "f85127cd-eeb3-4ec3-a919-208aef31a8a1",
        "referenceId": "data_session_history",
        "type": "data",
        "x": 2188.741701653493,
        "y": 1088.1630491346539,
        "customLabel": "Session Context",
        "notes": "Conversation history, user preferences, prior tool results.",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "b130ef3b-4df2-47aa-9668-a19a82a2f463",
        "referenceId": "task_plan",
        "type": "task",
        "x": 617.3771452580816,
        "y": 760.392083258425,
        "customLabel": "Plan Next Step",
        "notes": "Decide whether to respond directly or call a tool; choose which tool + arguments.",
        "attachments": [
          {
            "id": "agent-4-c",
            "referenceId": "const_system_instruction",
            "type": "constraint",
            "notes": "Tool-use policy: call tools only when needed, minimize access, be reversible when possible"
          },
          {
            "id": "agent-4-d",
            "referenceId": "const_cost_budget",
            "type": "constraint",
            "notes": "Limit tool calls / tokens / spend"
          }
        ],
        "measuredW": 280,
        "measuredH": 245
      },
      {
        "id": "b93dcd6f-ea6f-472e-b1ed-9eb5665fa666",
        "referenceId": "system_orchestrate",
        "type": "task",
        "x": 979.9302108305585,
        "y": 795.28910843005,
        "customLabel": "Orchestrate Loop",
        "notes": "Executes the plan: call tool, store results, decide whether to continue looping.",
        "attachments": [
          {
            "id": "agent-5-a",
            "referenceId": "const_rate_limit",
            "type": "constraint",
            "notes": "Respect API/tool rate limits and backoff"
          },
          {
            "id": "agent-5-b",
            "referenceId": "const_error_handling",
            "type": "constraint",
            "notes": "Handle tool errors; retry rules; graceful failure modes"
          },
          {
            "id": "agent-5-c",
            "referenceId": "const_audit_log",
            "type": "constraint",
            "notes": "Record tool calls + responses for traceability"
          }
        ],
        "measuredW": 280,
        "measuredH": 174
      },
      {
        "id": "a2179ffd-73df-4259-b53c-0c1212baae14",
        "referenceId": "system_api",
        "type": "task",
        "x": 1380.09039389692,
        "y": 776.2959734186082,
        "customLabel": "Call External API / Tool",
        "notes": "Agent invokes an external tool (search, calendar, CRM, payments, etc.).",
        "attachments": [
          {
            "id": "agent-6-b",
            "referenceId": "const_authentication",
            "type": "constraint",
            "notes": "Use least-privilege auth / scoped tokens"
          },
          {
            "id": "agent-6-c",
            "referenceId": "const_authorization",
            "type": "constraint",
            "notes": "Only act within user-approved scopes"
          },
          {
            "id": "agent-6-d",
            "referenceId": "const_privacy",
            "type": "constraint",
            "notes": "Avoid sending sensitive data unless necessary"
          }
        ],
        "measuredW": 280,
        "measuredH": 212
      },
      {
        "id": "653ddb47-8e3c-4de3-ac31-626b5c75cc60",
        "referenceId": "task_synthesize",
        "type": "task",
        "x": 1797.8107442480605,
        "y": 780.9369424077979,
        "customLabel": "Interpret + Update State",
        "notes": "Summarize tool results, update working memory/state, decide if more tool calls are needed.",
        "attachments": [
          {
            "id": "agent-7-c",
            "referenceId": "const_context_window",
            "type": "constraint",
            "notes": "Summarize + compress to preserve important details in limited context"
          }
        ],
        "measuredW": 280,
        "measuredH": 203
      },
      {
        "id": "105dbf99-3190-45ef-92a9-31337a928002",
        "referenceId": "system_rules",
        "type": "task",
        "x": 2178.5903544429625,
        "y": 799.6262819485538,
        "customLabel": "Stop / Continue Gate",
        "notes": "Check completion, confidence, and safety; decide to stop, loop, or ask the user.",
        "attachments": [
          {
            "id": "agent-8-a",
            "referenceId": "const_confidence",
            "type": "constraint",
            "notes": "If uncertain, request clarification or propose options"
          },
          {
            "id": "agent-8-b",
            "referenceId": "const_human_loop",
            "type": "constraint",
            "notes": "Require confirmation before irreversible actions (e.g., purchases, sending messages)"
          },
          {
            "id": "agent-8-c",
            "referenceId": "const_content_safety",
            "type": "constraint",
            "notes": "Refuse disallowed requests; constrain tool usage appropriately"
          }
        ],
        "measuredW": 280,
        "measuredH": 212
      },
      {
        "id": "bf180685-618c-436b-b609-7ccba3161899",
        "referenceId": "task_generate",
        "type": "task",
        "x": 2703.803800351588,
        "y": 785.1762701123663,
        "customLabel": "Respond / Present Result",
        "notes": "Produce final answer, action summary, and any next steps.",
        "attachments": [
          {
            "id": "agent-9-b",
            "referenceId": "const_format",
            "type": "constraint",
            "notes": "Structured output when useful (bullets, tables, citations, etc.)"
          },
          {
            "id": "agent-9-c",
            "referenceId": "const_tone",
            "type": "constraint",
            "notes": "Clear, concise, non-overconfident"
          }
        ],
        "measuredW": 280,
        "measuredH": 191,
        "personaId": "persona-user"
      },
      {
        "id": "2f9b2225-eb68-4ba5-9969-d6899aafadd7",
        "referenceId": "data_log",
        "type": "data",
        "x": 1478.679914925879,
        "y": 1036.2888717063065,
        "customLabel": "Tool Trace / Logs",
        "notes": "Tool call history, timings, errors (for debugging + audit).",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "fbb59506-b799-43ac-ada6-9354198d11e4",
        "referenceId": "zone_group",
        "type": "annotation",
        "subType": "zone",
        "x": 522.1497088509718,
        "y": 731.7245811698702,
        "width": 2020.7474395634267,
        "height": 706.1467887610082,
        "customLabel": "Tool-Using Agent Loop",
        "notes": "Plan → Orchestrate → Tool → Synthesize → Gate → (Loop or Respond)",
        "measuredW": 2021,
        "measuredH": 706
      },
      {
        "id": "95cac7b1-06f9-482f-a474-0f8f991be932",
        "referenceId": "zone_group",
        "type": "annotation",
        "subType": "note",
        "x": -115.00306891927741,
        "y": 616.8500829063324,
        "width": 444.61538461538447,
        "height": 120.25641025641026,
        "customLabel": "Core Pattern: Tool-Using Agent",
        "notes": "Minimal autonomous loop. Use a human-loop constraint for irreversible actions; keep state + logs; iterate until done.",
        "measuredW": 443,
        "measuredH": 120
      },
      {
        "id": "e9221a2e-725d-4de4-8b49-7fd7b9e108c3",
        "type": "data",
        "referenceId": "data_text",
        "x": 254.0903938969198,
        "y": 1004.7078727321093,
        "notes": "Natural-language request",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "ff0ae3e1-22ac-484d-80f6-41b0a94b992c",
        "type": "data",
        "referenceId": "data_structured_text",
        "x": 745.7981978896603,
        "y": 1284.49734641632,
        "notes": "Plan / intent / chosen tool",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "e1bf03d1-dd98-4638-adf4-2acba47a16c6",
        "type": "data",
        "referenceId": "data_json",
        "x": 732.6403031528187,
        "y": 1170.0762937847408,
        "notes": "Tool call arguments (JSON)",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "eee8d257-27b3-4f4f-8117-95f856a38770",
        "type": "data",
        "referenceId": "data_api_response",
        "x": 1480.8798675811302,
        "y": 1139.8749207870296,
        "notes": "Raw tool response (may be partial / paginated)",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "e16a433a-534c-46f4-ad08-697ca99aee1e",
        "type": "data",
        "referenceId": "data_state_vector",
        "x": 1902.5475863533236,
        "y": 1072.1474687235875,
        "notes": "Working memory / state update",
        "measuredW": 200,
        "measuredH": 93
      },
      {
        "id": "64d064f5-0cc5-44a2-a7c1-31abe1f5129d",
        "type": "data",
        "referenceId": "data_structured_text",
        "x": 1913.0739021427974,
        "y": 1210.5685213551665,
        "notes": "Intermediate synthesis / notes",
        "measuredW": 200,
        "measuredH": 78
      },
      {
        "id": "d74471f9-7074-4f2b-acf2-3de0640fbd17",
        "type": "data",
        "referenceId": "data_text",
        "x": 2792.2248529831672,
        "y": 1006.2289016913137,
        "notes": "User-facing response",
        "measuredW": 200,
        "measuredH": 78
      }
    ],
    "edges": [
      {
        "id": "d9ac4875-477d-4193-bdca-528ab835d23a",
        "source": "3efce7c8-f89e-4b2f-956b-b949a44fd9e5",
        "target": "35bb0c38-7496-416d-bc08-cb92fa7c2aaf"
      },
      {
        "id": "627ae4fe-6ea6-4014-981c-77dce75d90f5",
        "source": "f85127cd-eeb3-4ec3-a919-208aef31a8a1",
        "target": "b130ef3b-4df2-47aa-9668-a19a82a2f463",
        "label": "",
        "labelAnchor": {
          "t": 0.2263830391670795,
          "segmentIndex": 2,
          "segmentT": 0.21715383539998126
        }
      },
      {
        "id": "71dc3c2f-dfc0-4f48-94c9-95a04661168a",
        "source": "b130ef3b-4df2-47aa-9668-a19a82a2f463",
        "target": "b93dcd6f-ea6f-472e-b1ed-9eb5665fa666"
      },
      {
        "id": "19c94240-2cbb-4a49-a4b5-cb6d7cbc7ee2",
        "source": "b93dcd6f-ea6f-472e-b1ed-9eb5665fa666",
        "target": "a2179ffd-73df-4259-b53c-0c1212baae14",
        "label": "Tool call"
      },
      {
        "id": "3c63b849-de56-46e6-b080-fa7aedfbc506",
        "source": "a2179ffd-73df-4259-b53c-0c1212baae14",
        "target": "653ddb47-8e3c-4de3-ac31-626b5c75cc60",
        "label": "Results"
      },
      {
        "id": "284c9afb-0f69-4f3e-b137-648d095a51d4",
        "source": "653ddb47-8e3c-4de3-ac31-626b5c75cc60",
        "target": "105dbf99-3190-45ef-92a9-31337a928002"
      },
      {
        "id": "2038f762-bb89-4450-aab8-1d7767234516",
        "source": "105dbf99-3190-45ef-92a9-31337a928002",
        "target": "b130ef3b-4df2-47aa-9668-a19a82a2f463",
        "label": "Continue (loop)",
        "waypoints": [
          {
            "x": 2478.315789473684,
            "y": 879.6842105263158
          },
          {
            "x": 2478.315789473684,
            "y": 1410.4183535762486
          },
          {
            "x": 549.9473684210526,
            "y": 1410.4183535762486
          },
          {
            "x": 549.9473684210526,
            "y": 882.6842105263158
          }
        ]
      },
      {
        "id": "d1149379-3478-408f-8efa-6d539d925f7e",
        "source": "105dbf99-3190-45ef-92a9-31337a928002",
        "target": "bf180685-618c-436b-b609-7ccba3161899",
        "label": "Stop (done / ask user)"
      },
      {
        "id": "73a94599-4428-474e-91c4-6aff8b7da829",
        "source": "a2179ffd-73df-4259-b53c-0c1212baae14",
        "target": "2f9b2225-eb68-4ba5-9969-d6899aafadd7",
        "label": "Trace"
      },
      {
        "id": "19eb4296-4c35-4095-a218-124de35b5370",
        "source": "35bb0c38-7496-416d-bc08-cb92fa7c2aaf",
        "target": "e9221a2e-725d-4de4-8b49-7fd7b9e108c3"
      },
      {
        "id": "601ed2a6-c94e-4a8f-9cd1-afb1392c2f47",
        "source": "b130ef3b-4df2-47aa-9668-a19a82a2f463",
        "target": "ff0ae3e1-22ac-484d-80f6-41b0a94b992c"
      },
      {
        "id": "824fc615-c41b-477c-bab4-62492b9556c6",
        "source": "b130ef3b-4df2-47aa-9668-a19a82a2f463",
        "target": "e1bf03d1-dd98-4638-adf4-2acba47a16c6"
      },
      {
        "id": "069e24fd-8f08-45f3-8159-6407a094b885",
        "source": "a2179ffd-73df-4259-b53c-0c1212baae14",
        "target": "eee8d257-27b3-4f4f-8117-95f856a38770"
      },
      {
        "id": "dfe2ea60-10e0-4f01-8c25-deea2f159682",
        "source": "653ddb47-8e3c-4de3-ac31-626b5c75cc60",
        "target": "e16a433a-534c-46f4-ad08-697ca99aee1e"
      },
      {
        "id": "6203c052-59aa-481b-a702-5c4610255058",
        "source": "653ddb47-8e3c-4de3-ac31-626b5c75cc60",
        "target": "64d064f5-0cc5-44a2-a7c1-31abe1f5129d"
      },
      {
        "id": "476d9814-365d-4682-ae4b-6a45663f63af",
        "source": "bf180685-618c-436b-b609-7ccba3161899",
        "target": "d74471f9-7074-4f2b-acf2-3de0640fbd17"
      },
      {
        "id": "1717a940-aa3c-4bfe-a451-689f4513e7fd",
        "source": "e9221a2e-725d-4de4-8b49-7fd7b9e108c3",
        "target": "b130ef3b-4df2-47aa-9668-a19a82a2f463"
      },
      {
        "id": "23d736b8-d36a-49f6-bf41-2524ee42effa",
        "source": "d74471f9-7074-4f2b-acf2-3de0640fbd17",
        "target": "3efce7c8-f89e-4b2f-956b-b949a44fd9e5",
        "waypoints": [
          {
            "x": 3012,
            "y": 1045
          },
          {
            "x": 3012,
            "y": 1489.5238095238096
          },
          {
            "x": -152,
            "y": 1489.5238095238096
          },
          {
            "x": -152,
            "y": 895
          }
        ]
      },
      {
        "id": "edc698a0-f4f2-4c98-a6be-5854b5e3ad0c",
        "source": "105dbf99-3190-45ef-92a9-31337a928002",
        "target": "f85127cd-eeb3-4ec3-a919-208aef31a8a1"
      }
    ],
    "personas": [
      {
        "id": "persona-user",
        "name": "User",
        "role": "States goals, provides confirmations, consumes results",
        "color": "#3B82F6",
        "initials": "U",
        "category": "human"
      }
    ]
  },
  {
    "id": "tmpl_moderation",
    "name": "Content Moderation System",
    "description": "A safety-first pipeline for user-generated content, combining automated classification with human oversight.",
    "primary_use_case": "Social Media, Comment Sections, Forums",
    "complexity": "Low",
    "tags": [
      "Safety",
      "Classification",
      "Human-in-the-loop"
    ],
    "common_variations": [
      "Pre-moderation",
      "Post-moderation"
    ],
    "nodes": [
    {
      "id": "b262aec7-ca92-41fd-8c29-d94c25b7f3c1",
      "referenceId": "tp_web",
      "type": "touchpoint",
      "x": 133.1115633825367,
      "y": 910.9508009244665,
      "customLabel": "User Content Surface (Web/App)",
      "notes": "Where UGC is created and submitted.",
      "measuredW": 180,
      "measuredH": 103,
      "personaId": "persona-creator"
    },
    {
      "id": "565d41da-6140-4279-875d-2f5c922ebd3a",
      "referenceId": "human_upload_file",
      "type": "task",
      "x": 132.49300668150568,
      "y": 1064.095130821374,
      "customLabel": "Submit Content",
      "notes": "User posts text/image/video to the platform.",
      "attachments": [
        {
          "id": "cm-2-b",
          "referenceId": "const_user_consent",
          "type": "constraint",
          "notes": "User consents to moderation processing per TOS"
        }
      ],
      "measuredW": 280,
      "measuredH": 191,
      "personaId": "persona-creator"
    },
    {
      "id": "b7c322f8-9cc4-4edb-80e4-399ead6dc8bd",
      "referenceId": "data_multimodal",
      "type": "data",
      "x": 548.1412202106682,
      "y": 997.5785371199195,
      "customLabel": "UGC Item",
      "notes": "The submitted content to be moderated (plus metadata).",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "0d68b749-2672-4779-adb6-32f573e1c8ca",
      "referenceId": "const_content_safety",
      "type": "constraint",
      "x": 156.8601503698703,
      "y": 665.3654175251589,
      "customLabel": "Safety Policy Constraints",
      "notes": "Moderation must follow policy definitions (categories, thresholds, escalation).",
      "measuredW": 220,
      "measuredH": 137
    },
    {
      "id": "390f6ac0-e76f-4b19-8acf-80ebae765901",
      "referenceId": "data_policy",
      "type": "data",
      "x": 483.5668898244562,
      "y": 695.3077013393536,
      "customLabel": "Moderation Policy",
      "notes": "Rules, taxonomy, and enforcement definitions (source of truth).",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "dc4b0f3c-355b-43fc-8ab2-481d7947d1cf",
      "referenceId": "task_classify",
      "type": "task",
      "x": 931.1065440595851,
      "y": 733.5788186218971,
      "customLabel": "Automated Safety Classification",
      "notes": "Model assigns labels + risk scores (e.g., hate/harassment, sexual content, violence, self-harm, spam).",
      "attachments": [
        {
          "id": "cm-3-c",
          "referenceId": "const_latency",
          "type": "constraint",
          "notes": "Fast path for posting (e.g., < 1s target for non-escalations)"
        }
      ],
      "measuredW": 280,
      "measuredH": 230
    },
    {
      "id": "36354fc6-344a-4f48-a2ce-fba357e6ea95",
      "referenceId": "system_rules",
      "type": "task",
      "x": 1359.6871791778917,
      "y": 758.6037252221463,
      "customLabel": "Policy Decision + Routing",
      "notes": "Apply thresholds: allow, remove, limit distribution, or escalate to human review.",
      "attachments": [
        {
          "id": "cm-4-b",
          "referenceId": "const_quality_threshold",
          "type": "constraint",
          "notes": "Escalate if score in uncertain band or category requires review"
        },
        {
          "id": "cm-4-c",
          "referenceId": "const_human_loop",
          "type": "constraint",
          "notes": "Certain classes require human oversight"
        }
      ],
      "measuredW": 280,
      "measuredH": 189
    },
    {
      "id": "4535e5b7-54a7-41d9-9b4c-d23627266b46",
      "referenceId": "tp_web",
      "type": "touchpoint",
      "x": 156.76674109856188,
      "y": 561.9133414631426,
      "customLabel": "Moderator Console",
      "notes": "Queue view for escalated items; shows content, policy, model rationale/signals, and decision tools.",
      "measuredW": 180,
      "measuredH": 87,
      "personaId": "persona-moderator"
    },
    {
      "id": "0e8b38a2-24ba-4a5a-bbeb-201c7373bfb1",
      "referenceId": "human_review",
      "type": "task",
      "x": 1834.5638025545147,
      "y": 608.5322966507176,
      "customLabel": "Human Review + Decision",
      "notes": "Moderator confirms or overrides; adds rationale and selects enforcement action.",
      "attachments": [
        {
          "id": "cm-6-c",
          "referenceId": "const_audit_log",
          "type": "constraint",
          "notes": "Record who decided what, and why"
        }
      ],
      "measuredW": 280,
      "measuredH": 205,
      "personaId": "persona-moderator"
    },
    {
      "id": "031e4f7d-4659-42ba-b058-bfbf84ea2b56",
      "referenceId": "system_create_db",
      "type": "task",
      "x": 1795.4041879755457,
      "y": 983.7803703670075,
      "customLabel": "Persist Moderation Record",
      "notes": "Store decision, policy version, model version, and any human notes.",
      "attachments": [
        {
          "id": "cm-7-b",
          "referenceId": "const_data_retention",
          "type": "constraint",
          "notes": "Retention rules for logs and evidence"
        },
        {
          "id": "cm-7-c",
          "referenceId": "const_privacy",
          "type": "constraint",
          "notes": "Minimize stored personal data; redact where needed"
        }
      ],
      "measuredW": 280,
      "measuredH": 157
    },
    {
      "id": "a01fc9bd-dca1-474e-8037-036533422faf",
      "referenceId": "data_db_record",
      "type": "data",
      "x": 1897.133066623779,
      "y": 1224.6621667805878,
      "customLabel": "Moderation DB",
      "notes": "System-of-record for decisions + evidence pointers.",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "8710e8b8-7daa-4d38-b8fd-e4f09aeb7e5d",
      "referenceId": "system_notification",
      "type": "task",
      "x": 2153.3510447241097,
      "y": 960.5120521892966,
      "customLabel": "Notify + Enforce Outcome",
      "notes": "Apply enforcement (remove/limit) and notify user (and optionally appeal link).",
      "attachments": [
        {
          "id": "cm-8-b",
          "referenceId": "const_localization",
          "type": "constraint",
          "notes": "Localize user-facing explanations"
        },
        {
          "id": "cm-8-c",
          "referenceId": "const_error_handling",
          "type": "constraint",
          "notes": "Fallback if notification/enforcement fails"
        }
      ],
      "measuredW": 280,
      "measuredH": 212
    },
    {
      "id": "4f48688c-ccf4-4513-9482-2ad3e2371db8",
      "referenceId": "tp_web",
      "type": "touchpoint",
      "x": 2663.3716711565007,
      "y": 808.7450544811226,
      "customLabel": "User Sees Result",
      "notes": "Content is posted, limited, removed, or actioned; user can be shown a reason + appeal path.",
      "measuredW": 180,
      "measuredH": 139,
      "personaId": "persona-creator"
    },
    {
      "id": "59882fb1-7a49-44e8-a286-ce70eda7bbcd",
      "referenceId": "zone_group",
      "type": "annotation",
      "subType": "zone",
      "x": 863.9081349543809,
      "y": 512.3257911516326,
      "width": 1703.2317968788252,
      "height": 810.2003939635619,
      "customLabel": "Content Moderation Core Pipeline",
      "notes": "Classify → Policy decision/routing → Human review (if needed) → Persist → Notify/enforce",
      "measuredW": 1703,
      "measuredH": 808
    },
    {
      "id": "d7b73608-17c3-4743-8e7e-eb94b10a286f",
      "referenceId": "zone_group",
      "type": "annotation",
      "subType": "note",
      "x": 91.29344667033632,
      "y": 363.6041619121874,
      "width": 520.8771929824561,
      "height": 100,
      "customLabel": "Minimal Template: Content Moderation System",
      "notes": "Safety-first pipeline that combines automated classification with policy routing and human oversight.",
      "measuredW": 520,
      "measuredH": 99
    },
    {
      "id": "f565ee4e-75bb-4d3b-9064-3a14b9ad256a",
      "type": "data",
      "referenceId": "data_classification",
      "x": 1030.810555801268,
      "y": 1129.9154135338347,
      "notes": "Labels (multi-label) + categories",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "897afaa3-7431-4710-8dce-eeef3142d4ef",
      "type": "data",
      "referenceId": "data_score",
      "x": 1030.7909863296438,
      "y": 1017.6341023792356,
      "notes": "Risk/confidence scores",
      "measuredW": 200,
      "measuredH": 93
    },
    {
      "id": "5b4e0d80-b0a3-4b5b-b38a-a7aeb8d53000",
      "type": "data",
      "referenceId": "data_action",
      "x": 2233.8695703161648,
      "y": 615.5720216316192,
      "notes": "Final action: approve / restrict / remove / ban / escalate",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "b74a7818-05da-4fca-9c8f-09c18cd775ed",
      "type": "data",
      "referenceId": "data_text",
      "x": 2233.4494022489375,
      "y": 721.567819950947,
      "notes": "Moderator rationale / notes",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "b50fb8bf-ded9-46d3-815b-2335dbb3ec3b",
      "referenceId": "zone_group",
      "type": "annotation",
      "x": 86.20835268903843,
      "y": 509.9841812113787,
      "subType": "zone",
      "width": 752.5773195876291,
      "height": 321.6494845360824,
      "measuredW": 753,
      "measuredH": 322,
      "customLabel": "Policy & Moderation"
    },
    {
      "id": "b1b6f275-2745-4c24-896e-9b5d4db8b8e3",
      "referenceId": "zone_group",
      "type": "annotation",
      "x": 78.47639392615184,
      "y": 864.6233564691107,
      "subType": "zone",
      "width": 756.7010309278353,
      "height": 453.6082474226805,
      "measuredW": 758,
      "measuredH": 455,
      "customLabel": "End-User Input"
    }
  ],
  "edges": [
    {
      "id": "8a37e699-9943-4151-89cd-d1919f35eea6",
      "source": "b262aec7-ca92-41fd-8c29-d94c25b7f3c1",
      "target": "565d41da-6140-4279-875d-2f5c922ebd3a",
      "waypoints": [
        {
          "x": 333,
          "y": 962
        },
        {
          "x": 333,
          "y": 1035.5670103092784
        },
        {
          "x": 112,
          "y": 1035.5670103092784
        },
        {
          "x": 112,
          "y": 1160
        }
      ]
    },
    {
      "id": "4b22b63c-f981-4b74-9e9c-1cb7716aab7a",
      "source": "565d41da-6140-4279-875d-2f5c922ebd3a",
      "target": "b7c322f8-9cc4-4edb-80e4-399ead6dc8bd",
      "waypoints": [
        {
          "x": 484.5773195876289,
          "y": 1160
        },
        {
          "x": 484.5773195876289,
          "y": 1037
        }
      ]
    },
    {
      "id": "49bdb27f-2c65-4ca4-85ce-4c1df34bd45b",
      "source": "b7c322f8-9cc4-4edb-80e4-399ead6dc8bd",
      "target": "dc4b0f3c-355b-43fc-8ab2-481d7947d1cf"
    },
    {
      "id": "ad096e66-44b8-4a1f-81ec-3205eea93ce0",
      "source": "390f6ac0-e76f-4b19-8acf-80ebae765901",
      "target": "36354fc6-344a-4f48-a2ce-fba357e6ea95",
      "label": "Policy definitions",
      "waypoints": [
        {
          "x": 713.0111125987412,
          "y": 889
        },
        {
          "x": 713.0111125987412,
          "y": 696.8831168831166
        },
        {
          "x": 1340.1038961038962,
          "y": 696.8831168831166
        },
        {
          "x": 1340.1038961038962,
          "y": 766
        }
      ],
      "labelAnchor": {
        "t": 0.8247918982176371,
        "segmentIndex": 2,
        "segmentT": 0.867142280630184
      }
    },
    {
      "id": "0b4bcaa1-6cd2-4a6c-b59a-d00a7807b5c4",
      "source": "36354fc6-344a-4f48-a2ce-fba357e6ea95",
      "target": "0e8b38a2-24ba-4a5a-bbeb-201c7373bfb1",
      "label": "Escalate if uncertain/high-risk",
      "waypoints": [
        {
          "x": 1737.7706264323915,
          "y": 851
        },
        {
          "x": 1737.7706264323915,
          "y": 786
        }
      ],
      "labelAnchor": {
        "t": 0.5119379157351945,
        "segmentIndex": 1,
        "segmentT": 0.5119379157351945
      }
    },
    {
      "id": "42a84a6b-d033-4c33-82ea-095333952729",
      "source": "36354fc6-344a-4f48-a2ce-fba357e6ea95",
      "target": "031e4f7d-4659-42ba-b058-bfbf84ea2b56",
      "label": "Allow/limit/remove",
      "waypoints": [
        {
          "x": 1738.0259740259744,
          "y": 766
        },
        {
          "x": 1738.0259740259744,
          "y": 918
        }
      ],
      "labelAnchor": {
        "t": 0.12100132431438014,
        "segmentIndex": 1,
        "segmentT": 0.2627395148460499
      }
    },
    {
      "id": "c7fb766a-2466-4c79-bab5-f46a455475b1",
      "source": "4535e5b7-54a7-41d9-9b4c-d23627266b46",
      "target": "0e8b38a2-24ba-4a5a-bbeb-201c7373bfb1",
      "waypoints": [
        {
          "x": 1732.8092114071494,
          "y": 606
        },
        {
          "x": 1732.8092114071494,
          "y": 702
        }
      ]
    },
    {
      "id": "afc163dc-fec3-45f7-98b2-cc660dcac0da",
      "source": "0e8b38a2-24ba-4a5a-bbeb-201c7373bfb1",
      "target": "031e4f7d-4659-42ba-b058-bfbf84ea2b56",
      "waypoints": [
        {
          "x": 2135,
          "y": 711
        },
        {
          "x": 2135,
          "y": 951.8181818181818
        },
        {
          "x": 1775,
          "y": 951.8181818181818
        },
        {
          "x": 1775,
          "y": 1062
        }
      ]
    },
    {
      "id": "bbf079b8-0604-40ea-902b-9efed247ce35",
      "source": "031e4f7d-4659-42ba-b058-bfbf84ea2b56",
      "target": "a01fc9bd-dca1-474e-8037-036533422faf"
    },
    {
      "id": "acbb64b4-03c9-48b9-8303-fc96c04b1003",
      "source": "8710e8b8-7daa-4d38-b8fd-e4f09aeb7e5d",
      "target": "4f48688c-ccf4-4513-9482-2ad3e2371db8"
    },
    {
      "id": "02d06af8-76a7-4f2e-81c5-e9a61855e6d2",
      "source": "dc4b0f3c-355b-43fc-8ab2-481d7947d1cf",
      "target": "f565ee4e-75bb-4d3b-9064-3a14b9ad256a"
    },
    {
      "id": "11dd1d9d-7e01-4dff-b240-0701784f0549",
      "source": "dc4b0f3c-355b-43fc-8ab2-481d7947d1cf",
      "target": "897afaa3-7431-4710-8dce-eeef3142d4ef"
    },
    {
      "id": "8d3cb750-282b-4c02-a87c-3b2b017ec4ee",
      "source": "0e8b38a2-24ba-4a5a-bbeb-201c7373bfb1",
      "target": "5b4e0d80-b0a3-4b5b-b38a-a7aeb8d53000"
    },
    {
      "id": "9fd7e256-9937-4f4c-a465-e419dbad5560",
      "source": "0e8b38a2-24ba-4a5a-bbeb-201c7373bfb1",
      "target": "b74a7818-05da-4fca-9c8f-09c18cd775ed"
    },
    {
      "id": "6e231a70-1a6a-4252-b841-922bc76ac412",
      "source": "897afaa3-7431-4710-8dce-eeef3142d4ef",
      "target": "36354fc6-344a-4f48-a2ce-fba357e6ea95"
    },
    {
      "id": "a7a9e187-faae-4b40-8630-8cca015a9b58",
      "source": "f565ee4e-75bb-4d3b-9064-3a14b9ad256a",
      "target": "36354fc6-344a-4f48-a2ce-fba357e6ea95"
    },
    {
      "id": "b27a46fd-32eb-4671-bd44-dec65f4cca9b",
      "source": "0d68b749-2672-4779-adb6-32f573e1c8ca",
      "target": "390f6ac0-e76f-4b19-8acf-80ebae765901"
    },
    {
      "id": "8b1af50e-ae07-4b66-bb8f-c65eac443c59",
      "source": "a01fc9bd-dca1-474e-8037-036533422faf",
      "target": "8710e8b8-7daa-4d38-b8fd-e4f09aeb7e5d"
    },
    {
      "id": "bcada79e-e016-4cce-b5a9-bac7992e55a8",
      "source": "b74a7818-05da-4fca-9c8f-09c18cd775ed",
      "target": "4f48688c-ccf4-4513-9482-2ad3e2371db8"
    },
    {
      "id": "d0cb3b6a-65ad-44b5-a1b4-6551b70c9f2b",
      "source": "5b4e0d80-b0a3-4b5b-b38a-a7aeb8d53000",
      "target": "4f48688c-ccf4-4513-9482-2ad3e2371db8"
    }
  ],
  "personas": [
    {
      "id": "persona-creator",
      "name": "Content Creator",
      "role": "Submits user-generated content and receives moderation outcomes",
      "color": "#3B82F6",
      "initials": "CC",
      "category": "human"
    },
    {
      "id": "persona-moderator",
      "name": "Moderator",
      "role": "Reviews escalated content and makes final enforcement decisions",
      "color": "#F59E0B",
      "initials": "MO",
      "category": "human"
    }
  ]
  },
  {
    "id": "tmpl_game_enemy_ai",
    "name": "Video Game Enemy AI",
    "description": "Real-time enemy behavior system using perception, decision-making, and action execution for responsive game AI.",
    "primary_use_case": "Action games, strategy games, NPC behavior, combat AI, patrol/chase systems",
    "complexity": "Medium",
    "tags": [
      "Game AI",
      "Behavior Trees",
      "Real-time",
      "State Machines"
    ],
    "common_variations": [
      "Behavior trees vs. state machines",
      "Goal-oriented action planning (GOAP)",
      "Learning/adaptive AI",
      "Squad/group tactics"
    ],
    "nodes": [
    {
      "id": "b8b5a45c-ecd9-4ae2-af2e-2f7f7a3b98dc",
      "referenceId": "tp_3d_space",
      "type": "touchpoint",
      "x": 229.52531541764668,
      "y": 1017.0548291568801,
      "customLabel": "Game World (3D Space)",
      "notes": "Real-time simulation context where the enemy and player exist.",
      "measuredW": 180,
      "measuredH": 153
    },
    {
      "id": "4458ad1b-bd05-4f3f-adf9-374a1bc6abc6",
      "referenceId": "human_adjust_control",
      "type": "task",
      "x": 604.014468895346,
      "y": 800.3640631758337,
      "customLabel": "Player Moves / Acts",
      "notes": "Player movement/inputs create observable signals in the world.",
      "measuredW": 280,
      "measuredH": 169,
      "personaId": "persona-player"
    },
    {
      "id": "e1fa5ba9-e7af-4374-85ba-18bc7fb827fe",
      "referenceId": "task_detect",
      "type": "task",
      "x": 1321.7762237762236,
      "y": 781.0034965034965,
      "customLabel": "Perceive (Sight / Hearing)",
      "notes": "Detect player presence using line-of-sight + audio cues.",
      "attachments": [
        {
          "id": "enemy-3-c",
          "referenceId": "const_latency",
          "type": "constraint",
          "notes": "Must run per-frame / within budget (e.g., < 2–5ms AI slice)"
        }
      ],
      "measuredW": 280,
      "measuredH": 247,
      "personaId": "persona-enemy"
    },
    {
      "id": "fc5e9845-a88b-4c64-8dfe-b827ea7dd38d",
      "referenceId": "task_estimate",
      "type": "task",
      "x": 1672.6387674825176,
      "y": 803.1700174825177,
      "customLabel": "Estimate Threat / Distance",
      "notes": "Compute intent-relevant features (distance, visibility, risk).",
      "attachments": [
        {
          "id": "enemy-4-c",
          "referenceId": "const_compute_budget",
          "type": "constraint",
          "notes": "Keep estimation cheap and stable under load"
        }
      ],
      "measuredW": 280,
      "measuredH": 205,
      "personaId": "persona-enemy"
    },
    {
      "id": "ed280c7c-8f3a-4303-941c-23c90a0958ae",
      "referenceId": "task_plan",
      "type": "task",
      "x": 2123.2904167483603,
      "y": 788.2688604230659,
      "customLabel": "Decide Behavior",
      "notes": "Select an intent (patrol, investigate, chase, flank, attack, flee).",
      "attachments": [
        {
          "id": "enemy-5-c",
          "referenceId": "const_system_instruction",
          "type": "constraint",
          "notes": "Design rules (difficulty tuning, fairness, avoid perfect aim)"
        },
        {
          "id": "enemy-5-d",
          "referenceId": "const_quality_threshold",
          "type": "constraint",
          "notes": "Avoid jitter: hysteresis / cooldown before switching states"
        }
      ],
      "measuredW": 280,
      "measuredH": 247,
      "personaId": "persona-enemy"
    },
    {
      "id": "27b28cf3-7eea-47d4-a625-6c539da5ac71",
      "referenceId": "task_act",
      "type": "task",
      "x": 2513.0022408719487,
      "y": 807.1191278027453,
      "customLabel": "Execute Action",
      "notes": "Drive animation + navigation + attacks based on chosen behavior.",
      "attachments": [
        {
          "id": "enemy-6-c",
          "referenceId": "const_error_handling",
          "type": "constraint",
          "notes": "Fallbacks if path blocked / target lost"
        }
      ],
      "measuredW": 280,
      "measuredH": 247,
      "personaId": "persona-enemy"
    },
    {
      "id": "fb366673-d270-4d99-a750-7d36d1baa184",
      "referenceId": "task_adapt",
      "type": "task",
      "x": 2872.6737913446805,
      "y": 810.0405367369451,
      "customLabel": "Update Internal State",
      "notes": "Update memory + cooldowns + alertness based on outcomes.",
      "attachments": [
        {
          "id": "enemy-7-c",
          "referenceId": "const_caching",
          "type": "constraint",
          "notes": "Cache expensive queries (navmesh, LOS) to keep frame stable"
        }
      ],
      "measuredW": 280,
      "measuredH": 247,
      "personaId": "persona-enemy"
    },
    {
      "id": "45dae14c-d8fe-4f85-b5fb-88a3bbb39279",
      "referenceId": "system_timer",
      "type": "task",
      "x": 586.3410073072994,
      "y": 1158.376954506168,
      "customLabel": "Tick / Scheduling",
      "notes": "Run perception/decision at appropriate frequencies (per-frame, 10Hz, etc.).",
      "attachments": [
        {
          "id": "enemy-8-b",
          "referenceId": "const_rate_limit",
          "type": "constraint",
          "notes": "Throttle expensive checks under load"
        }
      ],
      "measuredW": 280,
      "measuredH": 189
    },
    {
      "id": "22aab6b5-7443-48b8-8486-03b331113da7",
      "referenceId": "zone_group",
      "type": "annotation",
      "subType": "zone",
      "x": 1269.7622377622379,
      "y": 733.6701631701635,
      "width": 2288.4308943089445,
      "height": 652.2357723577235,
      "customLabel": "Enemy AI Core Loop",
      "notes": "Perceive → Estimate → Decide → Act (+ State Update)",
      "measuredW": 2288,
      "measuredH": 652
    },
    {
      "id": "2558da0e-8077-4296-a391-be7c2e5dadd3",
      "referenceId": "zone_group",
      "type": "annotation",
      "subType": "note",
      "x": 492.11938061938054,
      "y": 569.7177822177824,
      "width": 540,
      "height": 120,
      "customLabel": "Minimal Template: Real-Time Enemy AI",
      "notes": "This is the smallest useful behavior system: perception, feature estimation, decision selection, action execution, and state update on a tick schedule.",
      "measuredW": 540,
      "measuredH": 120
    },
    {
      "id": "89ad7ce9-a45a-4800-9e61-3297ff809488",
      "type": "data",
      "referenceId": "data_trajectory",
      "x": 934.2616599065822,
      "y": 796.2404676702157,
      "notes": "Player movement path / pose changes",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "2f8c0115-3de9-4367-acbe-38aacabf7e13",
      "type": "data",
      "referenceId": "data_action",
      "x": 937.632446423436,
      "y": 905.7348496926877,
      "notes": "Player actions (attack, sprint, interact)",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "47fa0d8f-6665-4553-80a0-0069d70c155d",
      "type": "data",
      "referenceId": "data_sensor_stream",
      "x": 930.8489847667331,
      "y": 1053.465261530223,
      "notes": "World sensor signals (LOS checks, audio events)",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "661fa2b5-b4cb-4568-988a-4b342751b64c",
      "type": "data",
      "referenceId": "data_signal",
      "x": 1399.6305927082624,
      "y": 1060.9161178627198,
      "notes": "Detections (seen/heard, last known position)",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "e258a226-0bd1-4592-ad12-cfc39a693520",
      "type": "data",
      "referenceId": "data_state_vector",
      "x": 1772.638767482517,
      "y": 1032.7457750582753,
      "notes": "Feature vector (dist, cover, hp, cooldowns, alertness)",
      "measuredW": 200,
      "measuredH": 93
    },
    {
      "id": "e2159d00-735a-48f8-9ee3-e6cde31a0cd9",
      "type": "data",
      "referenceId": "data_score",
      "x": 1772.6387674825169,
      "y": 1137.4730477855478,
      "notes": "Threat score / confidence",
      "measuredW": 200,
      "measuredH": 93
    },
    {
      "id": "d14eb825-e836-497a-8f68-724c713e5c56",
      "type": "data",
      "referenceId": "data_selection",
      "x": 2224.594018806679,
      "y": 1074.7285516752108,
      "notes": "Chosen behavior / state transition",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "098368f7-4a85-450e-b03a-905e253dbeef",
      "type": "data",
      "referenceId": "data_action",
      "x": 2612.0378802849464,
      "y": 1088.318289228322,
      "notes": "Enemy action commands (move/aim/attack/use ability)",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "3145322c-f6f3-4723-82b3-5b221bfde458",
      "type": "data",
      "referenceId": "data_trajectory",
      "x": 2612.168599239195,
      "y": 1179.847700993028,
      "notes": "Movement path / steering output",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "905129b0-607f-40ab-8561-6ef5b2fe2233",
      "type": "data",
      "referenceId": "data_session_history",
      "x": 2972.1909833642576,
      "y": 1092.3595280853917,
      "notes": "Short-term memory (last seen pos, recent hits, failed actions)",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "52a491f2-4581-42b4-97f4-46e54cdf48bc",
      "type": "data",
      "referenceId": "data_db_record",
      "x": 2972.060264410009,
      "y": 1201.1961293925813,
      "notes": "Optional persistence (AI director stats, heatmaps)",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "13331387-ac62-42cd-9dff-b8dd90ffdac5",
      "type": "data",
      "referenceId": "data_signal",
      "x": 928.2623556219061,
      "y": 1214.5792016971793,
      "notes": "Update ticks (frame step, behavior tick, cooldown timers)",
      "measuredW": 200,
      "measuredH": 78
    },
    {
      "id": "7c1b79c7-b0a3-400b-977f-9f0e4b5a94e2",
      "referenceId": "system_state",
      "type": "task",
      "x": 3221.2278604854096,
      "y": 1095.9793975460932,
      "customLabel": "Persist World State",
      "notes": "Write back updated enemy state (memory, cooldowns, alertness) for next tick.",
      "measuredW": 280,
      "measuredH": 167
    },
    {
      "id": "e3345a58-6226-44b8-bcae-d769b29d05c4",
      "referenceId": "zone_group",
      "type": "annotation",
      "x": 473.58121830313075,
      "y": 734.2220363689943,
      "subType": "zone",
      "width": 769.6629213483147,
      "height": 653.932584269663,
      "measuredW": 769,
      "measuredH": 654,
      "customLabel": "Environment and Player"
    }
  ],
  "edges": [
    {
      "id": "6c5d5028-c2cb-4114-81e9-856868ef9170",
      "source": "b8b5a45c-ecd9-4ae2-af2e-2f7f7a3b98dc",
      "target": "4458ad1b-bd05-4f3f-adf9-374a1bc6abc6",
      "waypoints": [
        {
          "x": 501.91011235955057,
          "y": 1094
        },
        {
          "x": 501.91011235955057,
          "y": 885
        }
      ]
    },
    {
      "id": "baa594c2-66f1-4d31-bb8b-495a92c99ff4",
      "source": "e1fa5ba9-e7af-4374-85ba-18bc7fb827fe",
      "target": "fc5e9845-a88b-4c64-8dfe-b827ea7dd38d"
    },
    {
      "id": "28c0168f-2920-4374-9910-7486df03b932",
      "source": "b8b5a45c-ecd9-4ae2-af2e-2f7f7a3b98dc",
      "target": "45dae14c-d8fe-4f85-b5fb-88a3bbb39279",
      "waypoints": [
        {
          "x": 500.7865168539326,
          "y": 1094
        },
        {
          "x": 500.7865168539326,
          "y": 1253
        }
      ]
    },
    {
      "id": "01d0474f-ef5d-4e32-aead-c56fdea54dbf",
      "source": "4458ad1b-bd05-4f3f-adf9-374a1bc6abc6",
      "target": "89ad7ce9-a45a-4800-9e61-3297ff809488"
    },
    {
      "id": "14f6aaff-8217-4170-8f9a-6189da22fa3e",
      "source": "4458ad1b-bd05-4f3f-adf9-374a1bc6abc6",
      "target": "2f8c0115-3de9-4367-acbe-38aacabf7e13"
    },
    {
      "id": "4751f898-0d33-4f64-b25e-73464152a4ad",
      "source": "47fa0d8f-6665-4553-80a0-0069d70c155d",
      "target": "e1fa5ba9-e7af-4374-85ba-18bc7fb827fe",
      "waypoints": [
        {
          "x": 1201.7078651685395,
          "y": 1114
        },
        {
          "x": 1201.7078651685395,
          "y": 905
        }
      ]
    },
    {
      "id": "1ddf8529-77a7-4b12-8912-1d0d3553646d",
      "source": "e1fa5ba9-e7af-4374-85ba-18bc7fb827fe",
      "target": "661fa2b5-b4cb-4568-988a-4b342751b64c"
    },
    {
      "id": "93c184a8-9a3d-4875-9d8c-74a17a7f1f95",
      "source": "fc5e9845-a88b-4c64-8dfe-b827ea7dd38d",
      "target": "e258a226-0bd1-4592-ad12-cfc39a693520"
    },
    {
      "id": "61818998-9ff8-47bb-8ea7-b79484beeba3",
      "source": "fc5e9845-a88b-4c64-8dfe-b827ea7dd38d",
      "target": "e2159d00-735a-48f8-9ee3-e6cde31a0cd9"
    },
    {
      "id": "2f8f03b8-08db-44e2-9112-cb3e5114c2c2",
      "source": "ed280c7c-8f3a-4303-941c-23c90a0958ae",
      "target": "d14eb825-e836-497a-8f68-724c713e5c56"
    },
    {
      "id": "c89c7e11-3fca-45be-a3a8-5556b67326f1",
      "source": "27b28cf3-7eea-47d4-a625-6c539da5ac71",
      "target": "098368f7-4a85-450e-b03a-905e253dbeef"
    },
    {
      "id": "4b0590c8-4550-41c6-9a56-08858a131dff",
      "source": "27b28cf3-7eea-47d4-a625-6c539da5ac71",
      "target": "3145322c-f6f3-4723-82b3-5b221bfde458"
    },
    {
      "id": "93407012-9663-4492-8484-ffc38baa9c63",
      "source": "fb366673-d270-4d99-a750-7d36d1baa184",
      "target": "905129b0-607f-40ab-8561-6ef5b2fe2233"
    },
    {
      "id": "8a7129d3-307b-4a7a-808d-1c300cef6c44",
      "source": "fb366673-d270-4d99-a750-7d36d1baa184",
      "target": "52a491f2-4581-42b4-97f4-46e54cdf48bc"
    },
    {
      "id": "e724b865-ad0e-4559-b4c4-54ccbf0df17c",
      "source": "45dae14c-d8fe-4f85-b5fb-88a3bbb39279",
      "target": "13331387-ac62-42cd-9dff-b8dd90ffdac5"
    },
    {
      "id": "f0a800cb-1c26-4995-8829-42697c2cb9e4",
      "source": "89ad7ce9-a45a-4800-9e61-3297ff809488",
      "target": "e1fa5ba9-e7af-4374-85ba-18bc7fb827fe",
      "waypoints": [
        {
          "x": 1182.112359550562,
          "y": 678
        },
        {
          "x": 1182.112359550562,
          "y": 905
        }
      ]
    },
    {
      "id": "9ac848a4-5e8b-4e0b-a7af-f4bc2e455065",
      "source": "2f8c0115-3de9-4367-acbe-38aacabf7e13",
      "target": "e1fa5ba9-e7af-4374-85ba-18bc7fb827fe",
      "waypoints": [
        {
          "x": 1182.1123595505617,
          "y": 783
        },
        {
          "x": 1182.1123595505617,
          "y": 905
        }
      ]
    },
    {
      "id": "9e7b3fa6-fc92-49b6-8a5d-b4110ac124d4",
      "source": "e258a226-0bd1-4592-ad12-cfc39a693520",
      "target": "ed280c7c-8f3a-4303-941c-23c90a0958ae"
    },
    {
      "id": "7f0b1a4c-b089-4de6-b948-f048bd1610a7",
      "source": "e2159d00-735a-48f8-9ee3-e6cde31a0cd9",
      "target": "ed280c7c-8f3a-4303-941c-23c90a0958ae"
    },
    {
      "id": "20074fe0-3827-4c2c-8660-0a836d00e872",
      "source": "b8b5a45c-ecd9-4ae2-af2e-2f7f7a3b98dc",
      "target": "47fa0d8f-6665-4553-80a0-0069d70c155d"
    },
    {
      "id": "af5fc327-1176-44f3-8576-0de705e018ce",
      "source": "d14eb825-e836-497a-8f68-724c713e5c56",
      "target": "27b28cf3-7eea-47d4-a625-6c539da5ac71"
    },
    {
      "id": "c9bb8a84-9197-48e6-a7b2-d3d862ca0a74",
      "source": "098368f7-4a85-450e-b03a-905e253dbeef",
      "target": "fb366673-d270-4d99-a750-7d36d1baa184"
    },
    {
      "id": "15a5d6b8-b6ce-47bf-8105-394c7382b654",
      "source": "3145322c-f6f3-4723-82b3-5b221bfde458",
      "target": "fb366673-d270-4d99-a750-7d36d1baa184"
    },
    {
      "id": "bf72b201-0301-4cd6-be8a-aa64fe0a7fb2",
      "source": "905129b0-607f-40ab-8561-6ef5b2fe2233",
      "target": "7c1b79c7-b0a3-400b-977f-9f0e4b5a94e2"
    },
    {
      "id": "e14c9e7f-2f10-4970-b26f-8c033ebf2ac5",
      "source": "52a491f2-4581-42b4-97f4-46e54cdf48bc",
      "target": "7c1b79c7-b0a3-400b-977f-9f0e4b5a94e2"
    },
    {
      "id": "e77399c1-cc5f-4a86-bdd3-2d4b871e9c8a",
      "source": "7c1b79c7-b0a3-400b-977f-9f0e4b5a94e2",
      "target": "ed280c7c-8f3a-4303-941c-23c90a0958ae",
      "waypoints": [
        {
          "x": 3520.850055839652,
          "y": 1450.8411214953271
        },
        {
          "x": 3520.850055839652,
          "y": 1316.8269888306359
        },
        {
          "x": 2089.570093457944,
          "y": 1316.8269888306359
        },
        {
          "x": 2089.570093457944,
          "y": 911.841121495327
        }
      ],
      "label": "State informs next decision",
      "labelAnchor": {
        "t": 0.13934697187074532,
        "segmentIndex": 2,
        "segmentT": 0.09588251913963677
      }
    },
    {
      "id": "3af4a208-56f6-4dbf-bb22-72e1bce1eaab",
      "source": "13331387-ac62-42cd-9dff-b8dd90ffdac5",
      "target": "e1fa5ba9-e7af-4374-85ba-18bc7fb827fe",
      "waypoints": [
        {
          "x": 1237.8426966292136,
          "y": 1258
        },
        {
          "x": 1237.8426966292136,
          "y": 905
        }
      ]
    }
  ],
  "personas": [
    {
      "id": "persona-player",
      "name": "Player",
      "role": "Creates actions/signals the enemy reacts to",
      "initials": "PL",
      "category": "human",
      "color": "#22C55E"
    },
    {
      "id": "persona-enemy",
      "name": "Enemy Agent",
      "role": "Perceives, decides, and acts in real-time",
      "initials": "EN",
      "category": "ai",
      "color": "#EF4444"
    }
  ]
  }
]
;
