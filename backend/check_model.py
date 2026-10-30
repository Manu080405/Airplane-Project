import joblib

model = joblib.load("model/ticket_purchase_model.pkl")

print("Features expected:", model.n_features_in_)

print("\nFeature names:")

print(model.feature_names_in_)