---
id: cinematic-nav
name: "Кинематографическая навигация из 3D Gaussian Splatting"
meta: "Март 2026"
tags: ["gsplat", "YOLO", "GPU", "Python", "ffmpeg"]
github: "https://github.com/artyomzifir/cinematic-navigation-cv"
stack: "Python · gsplat · YOLO · ffmpeg · CUDA"
order: 1
mode: hard
problem: "Генерация кинематографического облёта сцены из 3DGS с возвратом к объектам интереса."
solution: "GPU-пайплайн на gsplat с двумя планировщиками (плоский XZ и 3D рельс) + YOLO depth backprojection + плавный revisit pass."
result: "MP4-вывод через ffmpeg streaming; устранена OOM заменой in-memory на pipe."
---

## bullets
- Планировщик плоского XZ пути с поведениями на сегментах (look_at, height_arc, yaw spin)
- 3D-рельс с оценкой высоты пола через перцентильную выборку Gaussian patches
- YOLO-детекция с обратной проекцией в мировые координаты и интерполяцией ориентации
