---
id: project-fabian
name: "Innopolis University — Project Fabian"
meta: "Sep – Dec 2025 · ML/CV Engineer"
tags: ["YOLO11", "ONNX", "Jetson", "ROS2", "Docker"]
github: "https://github.com/Innopolis-Robotics-Society/project_fabian"
order: 4
mode: hard
---

Real-time human pose estimation pipeline for Unitree A1 robot dog.

## bullets
- Designed full ROS2 perception pipeline: camera → YOLO11 pose via ONNX Runtime CUDA → custom messages → control loop
- Benchmarked YOLO11 s/m/l on Jetson Orin Nano 4GB (JetPack 6, CUDA 12.6): ~15 FPS end-to-end, best case 22–23 FPS
- Added IoU tracking, 17-keypoint format, arm64/amd64 Docker builds
