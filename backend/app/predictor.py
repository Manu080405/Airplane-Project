from app.preprocess import preprocess_input
from app.utils.model_loader import load_model

model = load_model()


def predict_ticket_purchase(data):
    features = preprocess_input(data)

    prediction = model.predict(features)[0]
    probability = float(model.predict_proba(features)[0].max())

    return {
        "prediction": "Ticket Purchased" if prediction == 1 else "Ticket Not Purchased",
        "probability": round(probability * 100, 2),
    }