import pandas as pd


GENDER_MAP = {
    "Female": 0,
    "Male": 1,
}

CUSTOMER_TYPE_MAP = {
    "Loyal Customer": 0,
    "disloyal Customer": 1,
}

TRAVEL_TYPE_MAP = {
    "Business travel": 0,
    "Personal Travel": 1,
}

CLASS_MAP = {
    "Business": 0,
    "Eco": 1,
    "Eco Plus": 2,
}

# Update these if your LabelEncoder used different values
DEVICE_TYPE_MAP = {
    "Laptop": 0,
    "Mobile": 1,
}

CAMPAIGN_SOURCE_MAP = {
    "Google": 0,
    "Facebook": 1,
    "Instagram": 2,
    "Email": 3,
}


def preprocess_input(data):
    features = pd.DataFrame(
        [{
            "Gender": GENDER_MAP[data.gender],
            "Customer_Type": CUSTOMER_TYPE_MAP[data.customer_type],
            "Age": data.age,
            "Type_of_Travel": TRAVEL_TYPE_MAP[data.travel_type],
            "Class": CLASS_MAP[data.travel_class],
            "Flight_Distance": data.flight_distance,

            "Inflight_wifi_service": data.inflight_wifi_service,
            "Departure_Arrival_time_convenient": data.departure_arrival_time_convenient,
            "Ease_of_Online_booking": data.ease_of_online_booking,
            "Gate_location": data.gate_location,
            "Food_and_drink": data.food_and_drink,
            "Online_boarding": data.online_boarding,
            "Seat_comfort": data.seat_comfort,
            "Inflight_entertainment": data.inflight_entertainment,
            "On_board_service": data.onboard_service,
            "Leg_room_service": data.leg_room_service,
            "Baggage_handling": data.baggage_handling,
            "Checkin_service": data.checkin_service,
            "Inflight_service": data.inflight_service,
            "Cleanliness": data.cleanliness,

            "Departure_Delay_in_Minutes": data.departure_delay,
            "Arrival_Delay_in_Minutes": data.arrival_delay,

            "Device_Type": DEVICE_TYPE_MAP[data.device_type],
            "Campaign_Source": CAMPAIGN_SOURCE_MAP[data.campaign_source],
            "Website_Visits": data.website_visits,
            "Ad_Clicks": data.ad_clicks,
            "Time_On_Website": data.time_on_website,
            "Previous_Bookings": data.previous_bookings,
            "Loyalty_Score": data.loyalty_score,
        }]
    )

    return features