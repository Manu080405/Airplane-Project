from pydantic import BaseModel


class PredictionRequest(BaseModel):
    gender: str
    customer_type: str
    age: int
    travel_type: str
    travel_class: str
    flight_distance: int

    inflight_wifi_service: int
    departure_arrival_time_convenient: int
    ease_of_online_booking: int
    gate_location: int
    food_and_drink: int
    online_boarding: int
    seat_comfort: int
    inflight_entertainment: int
    onboard_service: int
    leg_room_service: int
    baggage_handling: int
    checkin_service: int
    inflight_service: int
    cleanliness: int

    departure_delay: int
    arrival_delay: int

    # NEW FEATURES
    device_type: str
    campaign_source: str
    website_visits: int
    ad_clicks: int
    time_on_website: float
    previous_bookings: int
    loyalty_score: float


class PredictionResponse(BaseModel):
    prediction: str
    probability: float