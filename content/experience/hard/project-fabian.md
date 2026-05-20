---
id: project-fabian
order: 4
mode: hard
github: "https://github.com/Innopolis-Robotics-Society/project_fabian"
tags: ["YOLO11", "ONNX", "Jetson", "ROS2", "Docker"]
name_en: "Innopolis University — Project Fabian"
name_ru: "Университет Иннополис — Project Fabian"
meta_en: "Sep – Dec 2025 · ML/CV Engineer"
meta_ru: "Сен – Дек 2025 · ML/CV-инженер"
---

## en

Real-time human pose estimation pipeline for Unitree A1 robot dog.

### bullets
- Designed full ROS2 perception pipeline: camera → YOLO11 pose via ONNX Runtime CUDA → custom messages → control loop
- Benchmarked YOLO11 s/m/l on Jetson Orin Nano 4GB (JetPack 6, CUDA 12.6): ~15 FPS end-to-end, best case 22–23 FPS
- Added IoU tracking, 17-keypoint format, arm64/amd64 Docker builds

## ru

Пайплайн детекции поз людей в реальном времени для робота-собаки Unitree A1.

### bullets
- Спроектирован полный ROS2 пайплайн: камера → YOLO11 через ONNX Runtime CUDA → custom messages → контур управления
- Бенчмарк YOLO11 s/m/l на Jetson Orin Nano 4GB (JetPack 6, CUDA 12.6): ~15 FPS end-to-end, лучший результат 22–23 FPS
- IoU-трекинг, 17-keypoint формат, Docker-сборки для arm64/amd64
