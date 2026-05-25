---
id: pcb-inspector
order: 3
mode: hard
github: "https://github.com/Innopolis-Robotics-Society/robot-assistants"
tags: ["YOLO11", "Roboflow", "ROS2", "Metrics"]
name_en: "Innopolis University — PCB Inspector"
name_ru: "Университет Иннополис — PCB Inspector"
meta_en: "Jan – Feb 2026 · ML/CV Engineer"
meta_ru: "Янв – Фев 2026 · ML/CV-инженер"
---

## en

ROS2 node for automated PCB assembly verification.

### bullets
- Developed pcb_inspector ROS2 node: YOLO-based detection with geometry report (dx, dy, dw_rel, dh_rel, IoU)
- Annotated Roboflow dataset (12 classes), trained YOLO11s
- Results: mAP50 0.964 · mAP50-95 0.734 · precision 0.978 · recall 0.949 · 15.1 ms on RTX 3050m

## ru

ROS2-нода для автоматической верификации сборки печатных плат.

### bullets
- Разработана нода pcb_inspector: детекция компонентов YOLO + отчёт по геометрии (dx, dy, dw_rel, dh_rel, IoU)
- Размечен датасет Roboflow (12 классов), обучена YOLO11s
- Результат: mAP50 0.964 · mAP50-95 0.734 · precision 0.978 · recall 0.949 · 15.1 мс на RTX 3050m
