---
id: autmobrob-waypoints
name: "Waypoint Navigation Controller"
meta: "2025 · Autonomous Mobile Robotics course"
tags: ["ROS2", "Navigation", "Odometry", "Python", "Differential Drive"]
github: "https://github.com/artyomzifir/AutMobRob-Assignment1"
stack: "ROS2 · Python · Gazebo"
order: 5
mode: hard
problem: "Control a differential drive robot to follow a predefined sequence of waypoints using odometry."
solution: "ROS2 node subscribing to odometry, publishing velocity commands, with trajectory visualization."
result: "Robot successfully tracks waypoint sequence; desired vs actual trajectory plotted for comparison."
---

## bullets
- Developed ROS2 control node: odometry subscriber + velocity command publisher
- Implemented pure pursuit / proportional controller for waypoint following
- Visualized and compared desired vs actual trajectory
