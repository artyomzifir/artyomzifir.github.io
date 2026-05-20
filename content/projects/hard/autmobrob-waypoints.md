---
id: autmobrob-waypoints
order: 5
mode: hard
github: "https://github.com/artyomzifir/AutMobRob-Assignment1"
tags: ["ROS2", "Navigation", "Odometry", "Python", "Differential Drive"]
name_en: "Waypoint Navigation Controller"
name_ru: "Контроллер навигации по вейпоинтам"
meta_en: "2025 · Autonomous Mobile Robotics course"
meta_ru: "2025 · Курс «Автономные мобильные роботы»"
stack_en: "ROS2 · Python · Gazebo"
stack_ru: "ROS2 · Python · Gazebo"
problem_en: "Control a differential drive robot to follow a predefined sequence of waypoints using odometry."
problem_ru: "Управлять дифференциальным роботом для следования по заданной последовательности вейпоинтов через одометрию."
solution_en: "ROS2 node subscribing to odometry, publishing velocity commands, with trajectory visualization."
solution_ru: "ROS2-нода: подписка на одометрию, публикация velocity commands, визуализация траектории."
result_en: "Robot successfully tracks waypoint sequence; desired vs actual trajectory plotted for comparison."
result_ru: "Робот следует по последовательности вейпоинтов; сравнение желаемой и фактической траекторий."
---

## en

### bullets
- Developed ROS2 control node: odometry subscriber + velocity command publisher
- Implemented pure pursuit / proportional controller for waypoint following
- Visualized and compared desired vs actual trajectory

## ru

### bullets
- Разработал ROS2-ноду: подписчик одометрии + публикатор velocity commands
- Реализовал пропорциональный контроллер следования по вейпоинтам
- Визуализировал и сравнил желаемую и фактическую траектории
