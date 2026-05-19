---
id: pcb-inspector
name: "Innopolis University — PCB Inspector"
meta: "Jan – Feb 2026 · ML/CV Engineer"
tags: ["YOLO11", "Roboflow", "ROS2", "Metrics"]
github: "https://github.com/Innopolis-Robotics-Society/robot-assistants"
order: 3
mode: hard
---

ROS2 node for automated PCB assembly verification.

## bullets
- Developed pcb_inspector ROS2 node: YOLO-based detection with geometry report (dx, dy, dw_rel, dh_rel, IoU)
- Annotated Roboflow dataset (12 classes), trained YOLO11s
- Results: mAP50 0.964 · mAP50-95 0.734 · precision 0.978 · recall 0.949 · 15.1 ms on RTX 3050
