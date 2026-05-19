---
id: project-fabian
name: "Университет Иннополис — Project Fabian"
meta: "Сен – Дек 2025 · ML/CV-инженер"
tags: ["YOLO11", "ONNX", "Jetson", "ROS2", "Docker"]
github: "https://github.com/Innopolis-Robotics-Society/project_fabian"
order: 4
mode: hard
---

Пайплайн детекции поз людей в реальном времени для робота-собаки Unitree A1.

## bullets
- Спроектирован полный ROS2 пайплайн: камера → YOLO11 через ONNX Runtime CUDA → custom messages → контур управления
- Бенчмарк YOLO11 s/m/l на Jetson Orin Nano 4GB (JetPack 6, CUDA 12.6): ~15 FPS end-to-end, лучший результат 22–23 FPS
- IoU-трекинг, 17-keypoint формат, Docker-сборки для arm64/amd64
