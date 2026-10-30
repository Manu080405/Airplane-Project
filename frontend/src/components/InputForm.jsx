import { useState } from "react";
import api from "../services/api";
import {
  FaUserAlt,
  FaStar,
  FaClock,
  FaBullhorn,
} from "react-icons/fa";

function InputForm({ setPrediction }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    gender: "Male",
    customer_type: "Loyal Customer",
    age: 30,
    travel_type: "Business travel",
    travel_class: "Business",
    flight_distance: 1000,
    inflight_wifi_service: 3,
    departure_arrival_time_convenient: 3,
    ease_of_online_booking: 3,
    gate_location: 3,
    food_and_drink: 3,
    online_boarding: 3,
    seat_comfort: 3,
    inflight_entertainment: 3,
    onboard_service: 3,
    leg_room_service: 3,
    baggage_handling: 3,
    checkin_service: 3,
    inflight_service: 3,
    cleanliness: 3,
    departure_delay: 0,
    arrival_delay: 0,
    device_type: "Laptop",
    campaign_source: "Google",
    website_visits: 10,
    ad_clicks: 2,
    time_on_website: 5,
    previous_bookings: 1,
    loyalty_score: 50
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(value) || value === "" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/predict", formData);
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
      alert("Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      {/* PASSENGER INFORMATION */}
      <section className="card">
        <div className="card-header">
          <div className="card-icon">
            <FaUserAlt />
          </div>
          <div className="card-header-text">
            <h2>Passenger Information</h2>
            <p className="card-desc">Traveler profile and trip details</p>
          </div>
        </div>
        <div className="grid">
          <div>
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div>
            <label>Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} />
          </div>
          <div>
            <label>Customer Type</label>
            <select name="customer_type" value={formData.customer_type} onChange={handleChange}>
              <option>Loyal Customer</option>
              <option>disloyal Customer</option>
            </select>
          </div>
          <div>
            <label>Travel Type</label>
            <select name="travel_type" value={formData.travel_type} onChange={handleChange}>
              <option>Business travel</option>
              <option>Personal Travel</option>
            </select>
          </div>
          <div>
            <label>Travel Class</label>
            <select name="travel_class" value={formData.travel_class} onChange={handleChange}>
              <option>Business</option>
              <option>Eco</option>
              <option>Eco Plus</option>
            </select>
          </div>
          <div>
            <label>Flight Distance</label>
            <input
              type="number"
              name="flight_distance"
              value={formData.flight_distance}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      {/* SERVICE RATINGS */}
      <section className="card">
        <div className="card-header">
          <div className="card-icon">
            <FaStar />
          </div>
          <div className="card-header-text">
            <h2>Service Ratings</h2>
            <p className="card-desc">Rate each aspect from 1 (poor) to 5 (excellent)</p>
          </div>
        </div>
        <div className="grid">
          <div>
            <label>Inflight WiFi</label>
            <input type="number" min="1" max="5" name="inflight_wifi_service" value={formData.inflight_wifi_service} onChange={handleChange} />
          </div>
          <div>
            <label>Departure / Arrival Convenience</label>
            <input type="number" min="1" max="5" name="departure_arrival_time_convenient" value={formData.departure_arrival_time_convenient} onChange={handleChange} />
          </div>
          <div>
            <label>Ease of Online Booking</label>
            <input type="number" min="1" max="5" name="ease_of_online_booking" value={formData.ease_of_online_booking} onChange={handleChange} />
          </div>
          <div>
            <label>Gate Location</label>
            <input type="number" min="1" max="5" name="gate_location" value={formData.gate_location} onChange={handleChange} />
          </div>
          <div>
            <label>Food & Drink</label>
            <input type="number" min="1" max="5" name="food_and_drink" value={formData.food_and_drink} onChange={handleChange} />
          </div>
          <div>
            <label>Online Boarding</label>
            <input type="number" min="1" max="5" name="online_boarding" value={formData.online_boarding} onChange={handleChange} />
          </div>
          <div>
            <label>Seat Comfort</label>
            <input type="number" min="1" max="5" name="seat_comfort" value={formData.seat_comfort} onChange={handleChange} />
          </div>
          <div>
            <label>Inflight Entertainment</label>
            <input type="number" min="1" max="5" name="inflight_entertainment" value={formData.inflight_entertainment} onChange={handleChange} />
          </div>
          <div>
            <label>On Board Service</label>
            <input type="number" min="1" max="5" name="onboard_service" value={formData.onboard_service} onChange={handleChange} />
          </div>
          <div>
            <label>Leg Room Service</label>
            <input type="number" min="1" max="5" name="leg_room_service" value={formData.leg_room_service} onChange={handleChange} />
          </div>
          <div>
            <label>Baggage Handling</label>
            <input type="number" min="1" max="5" name="baggage_handling" value={formData.baggage_handling} onChange={handleChange} />
          </div>
          <div>
            <label>Check-in Service</label>
            <input type="number" min="1" max="5" name="checkin_service" value={formData.checkin_service} onChange={handleChange} />
          </div>
          <div>
            <label>Inflight Service</label>
            <input type="number" min="1" max="5" name="inflight_service" value={formData.inflight_service} onChange={handleChange} />
          </div>
          <div>
            <label>Cleanliness</label>
            <input type="number" min="1" max="5" name="cleanliness" value={formData.cleanliness} onChange={handleChange} />
          </div>
        </div>
      </section>

      {/* FLIGHT DELAYS */}
      <section className="card">
        <div className="card-header">
          <div className="card-icon">
            <FaClock />
          </div>
          <div className="card-header-text">
            <h2>Flight Delays</h2>
            <p className="card-desc">Departure and arrival delay in minutes</p>
          </div>
        </div>
        <div className="grid">
          <div>
            <label>Departure Delay (Minutes)</label>
            <input type="number" name="departure_delay" value={formData.departure_delay} onChange={handleChange} />
          </div>
          <div>
            <label>Arrival Delay (Minutes)</label>
            <input type="number" name="arrival_delay" value={formData.arrival_delay} onChange={handleChange} />
          </div>
        </div>
      </section>

      {/* DIGITAL MARKETING INFORMATION */}
      <section className="card">
        <div className="card-header">
          <div className="card-icon">
            <FaBullhorn />
          </div>
          <div className="card-header-text">
            <h2>Digital Marketing Information</h2>
            <p className="card-desc">Ad engagement and browsing behavior</p>
          </div>
        </div>
        <div className="grid">
          <div>
            <label>Device Type</label>
            <select name="device_type" value={formData.device_type} onChange={handleChange}>
              <option>Laptop</option>
              <option>Mobile</option>
            </select>
          </div>
          <div>
            <label>Campaign Source</label>
            <select name="campaign_source" value={formData.campaign_source} onChange={handleChange}>
              <option>Google</option>
              <option>Facebook</option>
              <option>Instagram</option>
              <option>Email</option>
            </select>
          </div>
          <div>
            <label>Website Visits</label>
            <input type="number" name="website_visits" value={formData.website_visits} onChange={handleChange} />
          </div>
          <div>
            <label>Ad Clicks</label>
            <input type="number" name="ad_clicks" value={formData.ad_clicks} onChange={handleChange} />
          </div>
          <div>
            <label>Time On Website</label>
            <input type="number" step="0.1" name="time_on_website" value={formData.time_on_website} onChange={handleChange} />
          </div>
          <div>
            <label>Previous Bookings</label>
            <input type="number" name="previous_bookings" value={formData.previous_bookings} onChange={handleChange} />
          </div>
          <div>
            <label>Loyalty Score</label>
            <input type="number" step="0.1" name="loyalty_score" value={formData.loyalty_score} onChange={handleChange} />
          </div>
        </div>
      </section>

      <div className="predict-btn-wrap">
        <button type="submit" disabled={loading} className="predict-btn">
          {loading ? "Predicting..." : "Predict Ticket Purchase"}
        </button>
      </div>
    </form>
  );
}

export default InputForm;