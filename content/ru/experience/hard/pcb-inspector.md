---
id: pcb-inspector
name: "Университет Иннополис — PCB Inspector"
meta: "Янв – Фев 2026 · ML/CV-инженер"
tags: ["YOLO11", "Roboflow", "ROS2", "Метрики"]
github: "https://github.com/Innopolis-Robotics-Society/robot-assistants"
order: 3
mode: hard
---

ROS2-нода для автоматической верификации сборки печатных плат.

## bullets
- Разработана нода pcb_inspector: детекция компонентов YOLO + отчёт по геометрии (dx, dy, dw_rel, dh_rel, IoU)
- Размечен датасет Roboflow (12 классов), обучена YOLO11s
- Результат: mAP50 0.964 · mAP50-95 0.734 · precision 0.978 · recall 0.949 · 15.1 мс на RTX 3050
