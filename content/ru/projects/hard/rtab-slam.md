---
id: rtab-slam
name: "3D SLAM с RTAB-Map и стерео камерой"
meta: "2025 · ROS2 Humble"
tags: ["SLAM", "RTAB-Map", "ROS2", "Gazebo", "Стерео зрение", "3D картирование"]
github: "https://github.com/artyomzifir/rtab-stereo-ros"
stack: "ROS2 Humble · RTAB-Map · Gazebo · Python"
order: 3
mode: hard
problem: "Построить 3D-карту неизвестного окружения только на основе стерео камеры на мобильном роботе."
solution: "RTAB-Map со стерео камерой в симуляции Gazebo на дифференциально-приводном роботе под ROS2 Humble."
result: "Рабочий пайплайн 3D SLAM с детекцией замкнутых петель и повторным использованием карты."
---

## bullets
- Настроил RTAB-Map для работы со стерео камерой под ROS2 Humble
- Симулировал дифференциально-приводной робот в Gazebo со стерео камерой
- Настраивал параметры детекции замкнутых петель для надёжного построения 3D карты
