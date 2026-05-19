---
id: cinematic-nav
name: "Cinematic Navigation from 3D Gaussian Splatting"
meta: "Mar 2026"
tags: ["gsplat", "YOLO", "GPU", "Python", "ffmpeg"]
github: "https://github.com/artyomzifir/cinematic-navigation-cv"
stack: "Python · gsplat · YOLO · ffmpeg · CUDA"
order: 1
mode: hard
problem: "Generate cinematic camera flythrough from a 3DGS scene with object-aware revisits."
solution: "GPU pipeline on gsplat with two planners (flat XZ and 3D rail) + YOLO depth backprojection + smooth revisit pass."
result: "MP4 output via ffmpeg streaming; resolved OOM by switching from in-memory to pipe."
---

## bullets
- Flat XZ path planner with per-segment behaviours (look_at, height_arc, yaw spin)
- 3D rail with local floor-height estimation via percentile sampling of Gaussian patches
- YOLO detection with world-coordinate backprojection and smooth orientation interpolation
