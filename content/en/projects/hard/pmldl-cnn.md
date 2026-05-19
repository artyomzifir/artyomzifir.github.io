---
id: pmldl-cnn
name: "CNN Digit Classifier — FastAPI + Streamlit"
meta: "2025 · PMLDL Course"
tags: ["CNN", "PyTorch", "FastAPI", "Streamlit", "MNIST", "MLOps"]
github: "https://github.com/artyomzifir/pmldl-assignment-1"
stack: "PyTorch · FastAPI · Streamlit · Docker"
order: 6
mode: hard
problem: "End-to-end ML pipeline: train a model and expose it as a usable web service."
solution: "CNN trained on MNIST, served via FastAPI backend, with a Streamlit frontend for drawing and predicting digits."
result: "Fully working digit recognition app — draw a digit, get a prediction in real time."
---

## bullets
- Trained simple CNN on MNIST dataset with PyTorch
- Built FastAPI backend exposing model inference endpoint
- Built Streamlit frontend with canvas for drawing digits and displaying predictions
- Containerized with Docker for reproducibility
