import { FaPlaneDeparture } from "react-icons/fa";

function Header() {
  return (
    <header className="header">
      <div className="header-content">

        <div className="logo">

          <FaPlaneDeparture className="logo-icon"/>

          <div>

            <h1>AeroReach Insights</h1>

            <p>
              AI Powered Digital Ad Targeting for Ticket Purchases
            </p>

          </div>

        </div>

      </div>
    </header>
  );
}

export default Header;