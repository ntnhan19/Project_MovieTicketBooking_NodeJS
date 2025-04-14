// frontend/src/components/Booking/steps/Step4PaymentMethod.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../../services/paymentService';
import { BookingContext } from '../../../context/BookingContext';

function Step4Payment() {
  const navigate = useNavigate();
  const { bookingData, updateBookingData } = useContext(BookingContext);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Create payment payload
      const paymentPayload = {
        bookingId: bookingData.bookingId,
        amount: calculateTotalAmount(),
        paymentMethod,
        cardDetails: paymentMethod === 'credit_card' ? cardDetails : null,
        items: [
          { type: 'tickets', quantity: bookingData.seats.length, price: bookingData.ticketPrice },
          ...bookingData.snacks.map(snack => ({
            type: 'snack',
            id: snack.id,
            name: snack.name,
            quantity: snack.quantity,
            price: snack.price
          }))
        ]
      };

      // Process payment
      const result = await paymentService.processPayment(paymentPayload);

      // Update booking data with payment info
      updateBookingData({
        ...bookingData,
        payment: {
          id: result.paymentId,
          status: result.status,
          transactionId: result.transactionId
        }
      });

      // Navigate to success page
      navigate('/booking/success');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotalAmount = () => {
    const ticketsTotal = bookingData.seats.length * bookingData.ticketPrice;
    const snacksTotal = bookingData.snacks.reduce((total, snack) => 
      total + (snack.price * snack.quantity), 0);
    return ticketsTotal + snacksTotal;
  };

  return (
    <div className="payment-container">
      <h2>Payment Details</h2>
      
      <div className="booking-summary">
        <h3>Booking Summary</h3>
        <div className="summary-item">
          <span>Movie:</span>
          <span>{bookingData.movie?.title}</span>
        </div>
        <div className="summary-item">
          <span>Showtime:</span>
          <span>{bookingData.showtime?.date} - {bookingData.showtime?.time}</span>
        </div>
        <div className="summary-item">
          <span>Seats:</span>
          <span>{bookingData.seats?.join(', ')}</span>
        </div>
        {bookingData.snacks?.length > 0 && (
          <div className="summary-item">
            <span>Snacks:</span>
            <ul>
              {bookingData.snacks.map((snack, index) => (
                <li key={index}>{snack.name} x{snack.quantity} - ${snack.price * snack.quantity}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="total-amount">
          <strong>Total Amount:</strong>
          <strong>${calculateTotalAmount().toFixed(2)}</strong>
        </div>
      </div>

      <div className="payment-methods">
        <h3>Select Payment Method</h3>
        <div className="payment-method-options">
          <button 
            className={`method-btn ${paymentMethod === 'credit_card' ? 'active' : ''}`}
            onClick={() => handlePaymentMethodChange('credit_card')}
          >
            Credit Card
          </button>
          <button 
            className={`method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
            onClick={() => handlePaymentMethodChange('paypal')}
          >
            PayPal
          </button>
          <button 
            className={`method-btn ${paymentMethod === 'google_pay' ? 'active' : ''}`}
            onClick={() => handlePaymentMethodChange('google_pay')}
          >
            Google Pay
          </button>
        </div>
      </div>

      {paymentMethod === 'credit_card' && (
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="cardNumber">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={cardDetails.cardNumber}
              onChange={handleInputChange}
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="cardholderName">Cardholder Name</label>
            <input
              type="text"
              id="cardholderName"
              name="cardholderName"
              value={cardDetails.cardholderName}
              onChange={handleInputChange}
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={cardDetails.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cvv">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={cardDetails.cvv}
                onChange={handleInputChange}
                placeholder="123"
                required
              />
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="pay-button"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay $${calculateTotalAmount().toFixed(2)}`}
          </button>
        </form>
      )}

      {paymentMethod === 'paypal' && (
        <div className="alternate-payment">
          <p>You will be redirected to PayPal to complete your payment.</p>
          <button 
            onClick={handleSubmit}
            className="pay-button paypal-button"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Continue to PayPal'}
          </button>
        </div>
      )}

      {paymentMethod === 'google_pay' && (
        <div className="alternate-payment">
          <p>Pay with Google Pay</p>
          <button 
            onClick={handleSubmit}
            className="pay-button google-pay-button"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay with Google Pay'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Step4Payment;