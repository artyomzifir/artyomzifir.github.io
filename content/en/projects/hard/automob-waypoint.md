---
id: automob-waypoint
name: "Waypoint Navigation Controller"
meta: "2025 · ROS2"
tags: ["Navigation", "Odometry", "ROS2", "Differential Drive", "Control"]
github: "https://github.com/artyomzifir/AutMobRob-Assignment1"
stack: "ROS2 · Python · Gazebo"
order: 5
mode: hard
problem: "Control a differential drive robot to follow a predefined sequence of waypoints using odometry."
solution: "Custom control algorithm subscribing to odometry and publishing velocity commands to navigate the trajectory."
result: "Robot successfully follows waypoint sequence with trajectory visualization comparing desired vs actual path."
---

## bullets
- Developed control node subscribing to /odom and publishing to /cmd_vel
- Implemented waypoint following with heading correction and distance threshold logic
- Visualized and compared desired vs actual robot trajectory
