---
id: cinematic-nav
order: 1
mode: hard
github: "https://github.com/artyomzifir/cinematic-navigation-cv"
tags: ["gsplat", "YOLO", "GPU", "Python", "ffmpeg"]
name_en: "Cinematic Navigation from 3D Gaussian Splatting"
name_ru: "Кинематографическая навигация из 3D Gaussian Splatting"
meta_en: "Mar 2026"
meta_ru: "Март 2026"
stack_en: "Python · gsplat · YOLO · ffmpeg · CUDA"
stack_ru: "Python · gsplat · YOLO · ffmpeg · CUDA"
problem_en: "Generate cinematic camera flythrough from a 3DGS scene with object-aware revisits."
problem_ru: "Генерация кинематографического облёта сцены из 3DGS с возвратом к объектам интереса."
solution_en: "GPU pipeline on gsplat with two planners (flat XZ and 3D rail) + YOLO depth backprojection + smooth revisit pass."
solution_ru: "GPU-пайплайн на gsplat с двумя планировщиками (плоский XZ и 3D рельс) + YOLO depth backprojection + плавный revisit pass."
result_en: "MP4 output via ffmpeg streaming; resolved OOM by switching from in-memory to pipe."
result_ru: "MP4-вывод через ffmpeg streaming; устранена OOM заменой in-memory на pipe."
---

## en

### bullets
- Flat XZ path planner with per-segment behaviours (look_at, height_arc, yaw spin)
- 3D rail with local floor-height estimation via percentile sampling of Gaussian patches
- YOLO detection with world-coordinate backprojection and smooth orientation interpolation

## ru

### bullets
- Планировщик плоского XZ пути с поведениями на сегментах (look_at, height_arc, yaw spin)
- 3D-рельс с оценкой высоты пола через перцентильную выборку Gaussian patches
- YOLO-детекция с обратной проекцией в мировые координаты и интерполяцией ориентации
