import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, clearCart, navigateTo } = useApp();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [pinError, setPinError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digit characters and enforce max 6 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPostalCode(digitsOnly);

    if (digitsOnly.length === 0) {
      setPinError('');
    } else if (digitsOnly.length < 6) {
      setPinError('PIN code must be exactly 6 numeric digits');
    } else {
      setPinError('');
    }
  };

  // Load user profile if signed in
  useEffect(() => {
    const user = api.auth.getCurrentUser();
    if (user) {
      if (user.email) setEmail(user.email);
      if (user.first_name) setFirstName(user.first_name);
      if (user.last_name) setLastName(user.last_name);
      if (user.phone) setPhone(user.phone);

      api.customer.getAddresses().then((res) => {
        if (res.addresses && res.addresses.length > 0) {
          const def = res.addresses.find((a: any) => a.is_default) || res.addresses[0];
          setAddress1(def.address_1 || '');
          setCity(def.city || '');
          setState(def.state || '');
          setPostalCode(def.postal_code || '');
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.12);
  const total = subtotal;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (cart.length === 0) {
      setError('Your bespoke shopping bag is currently empty.');
      return;
    }

    if (!email.trim() || !address1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setError('Please complete all required delivery details marked with an asterisk (*).');
      return;
    }

    const cleanedPin = postalCode.trim();
    if (!/^\d{6}$/.test(cleanedPin)) {
      setPinError('PIN code must be exactly 6 numeric digits (e.g. 110001).');
      setError('Please provide a valid 6-digit Indian PIN code for insured delivery.');
      return;
    }

    // Pre-flight validation: Ensure every piece in the bag is orderable and sized
    for (const item of cart) {
      const backendProdId = item.product.backendId || item.product.id;
      if (!item.product.isAvailableInBackend || !backendProdId) {
        setError(
          `"${item.product.name}" is an archival bespoke design available by private atelier appointment only. Please remove it from your shopping bag to complete online checkout.`
        );
        return;
      }
      if (!item.size) {
        setError(`Please select an available chest size for "${item.product.name}" before proceeding.`);
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Create a fresh dedicated backend cart for this checkout session
      const backendCart = await api.cart.createCart();
      const cartId: string = backendCart.id;
      localStorage.setItem('waak_backend_cart_id', cartId);

      // 2. Synchronize all cart items into the backend cart with explicit error handling
      for (const item of cart) {
        const backendProdId = item.product.backendId || item.product.id;
        try {
          await api.cart.addItem(cartId, backendProdId, item.size, item.quantity);
        } catch (itemErr: any) {
          throw new Error(
            `Unable to reserve "${item.product.name}" (Size ${item.size}): ${itemErr.message || 'Atelier stock unavailable'}`
          );
        }
      }

      const shippingAddress = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        address_1: address1.trim(),
        city: city.trim(),
        state: state.trim(),
        postal_code: postalCode.trim(),
        country_code: 'IN',
      };

      // 3. Initiate Checkout on server
      const checkoutData = await api.checkout.createCheckout(cartId, email.trim(), shippingAddress);

      // 4. Verify payment with server using Razorpay Test Mode credentials
      const paymentId = `pay_rzp_${Date.now()}`;
      const verificationResult = await api.checkout.verifyPayment(
        checkoutData.order_id,
        checkoutData.razorpay_order_id,
        paymentId,
        'mock_test_signature'
      );

      if (verificationResult.success) {
        setConfirmedOrder(verificationResult.order);
        clearCart();
      } else {
        throw new Error('Payment verification could not be confirmed by the atelier server.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An unexpected error occurred during bespoke checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-modal-overlay">
      <style>{`
        .checkout-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(26, 5, 8, 0.75);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }
        .checkout-modal-card {
          background-color: var(--color-cream-light, #fbf8f2);
          border: 1px solid var(--color-border-gold, rgba(197, 162, 101, 0.4));
          border-radius: 8px;
          max-width: 560px;
          width: 100%;
          padding: 36px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.3);
          max-height: 90vh;
          overflow-y: auto;
        }
        .checkout-name-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .checkout-city-state-pin-grid {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr;
          gap: 10px;
          margin-bottom: 16px;
        }
        .checkout-pin-field {
          grid-column: auto;
        }
        .checkout-close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: var(--color-muted, #7A6258);
          min-width: 44px;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: color 0.2s ease;
        }
        .checkout-close-btn:hover {
          color: var(--color-burgundy, #5A121A);
        }
        @media (max-width: 480px) {
          .checkout-modal-overlay {
            padding: 10px;
          }
          .checkout-modal-card {
            padding: 24px 18px;
            max-height: 94vh;
          }
          .checkout-name-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .checkout-city-state-pin-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .checkout-pin-field {
            grid-column: span 2;
          }
        }
      `}</style>
      <div className="checkout-modal-card">
        {confirmedOrder ? (
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(197, 162, 101, 0.2)',
              color: 'var(--color-burgundy, #5A121A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid var(--color-gold, #C5A265)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <span style={{
              display: 'inline-block',
              fontSize: '11px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-gold, #C5A265)',
              fontWeight: 600,
              marginBottom: '8px',
            }}>
              Bespoke Order Confirmed
            </span>

            <h2 style={{
              fontFamily: 'var(--font-serif, "Cinzel", serif)',
              fontSize: '26px',
              color: 'var(--color-burgundy, #5A121A)',
              marginBottom: '12px',
            }}>
              Thank You for Patronizing WAAK
            </h2>

            <div style={{
              backgroundColor: 'var(--color-cream, #F4EFE6)',
              border: '1px dashed var(--color-gold, #C5A265)',
              padding: '16px',
              borderRadius: '4px',
              margin: '20px 0',
              textAlign: 'left',
              fontSize: '13px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-muted, #7A6258)' }}>Order Reference:</span>
                <strong style={{ color: 'var(--color-burgundy, #5A121A)' }}>{confirmedOrder.display_id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-muted, #7A6258)' }}>Payment Method:</span>
                <span>Razorpay (Verified)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-muted, #7A6258)' }}>Fulfillment Status:</span>
                <span style={{ textTransform: 'capitalize', color: '#2e7d32', fontWeight: 600 }}>In Atelier Crafting</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-muted, #7A6258)' }}>Total Realized:</span>
                <strong>₹{confirmedOrder.total?.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-muted, #7A6258)', marginBottom: '24px' }}>
              A bespoke receipt and dispatch docket have been dispatched to <strong>{confirmedOrder.email}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  onClose();
                  navigateTo('/account');
                }}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--color-burgundy, #5A121A)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                View in Atelier Account
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border-gold, #C5A265)',
                  color: 'var(--color-burgundy, #5A121A)',
                  padding: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <span style={{
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold, #C5A265)',
                  fontWeight: 600,
                }}>
                  Atelier Checkout
                </span>
                <h3 style={{
                  fontFamily: 'var(--font-serif, "Cinzel", serif)',
                  fontSize: '22px',
                  color: 'var(--color-burgundy, #5A121A)',
                  marginTop: '4px',
                }}>
                  Delivery & Payment
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close checkout modal"
                className="checkout-close-btn"
              >
                ×
              </button>
            </div>

            {error && (
              <div style={{
                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                color: '#d32f2f',
                padding: '10px 14px',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted, #7A6258)', marginBottom: '6px' }}>
                Contact Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@waak.in"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border-gold, #d8cbbe)',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  fontSize: '13px',
                }}
              />
            </div>

            <div className="checkout-name-grid">
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted, #7A6258)', marginBottom: '6px' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Aditya"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-gold, #d8cbbe)',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted, #7A6258)', marginBottom: '6px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Singhania"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-gold, #d8cbbe)',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted, #7A6258)', marginBottom: '6px' }}>
                Delivery Address *
              </label>
              <input
                type="text"
                required
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="14, Golf Links Enclave, Suite 4B"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border-gold, #d8cbbe)',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  fontSize: '13px',
                }}
              />
            </div>

            <div className="checkout-city-state-pin-grid">
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted, #7A6258)', marginBottom: '6px' }}>
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="New Delhi"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-gold, #d8cbbe)',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted, #7A6258)', marginBottom: '6px' }}>
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Delhi"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-gold, #d8cbbe)',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    fontSize: '13px',
                  }}
                />
              </div>
              <div className="checkout-pin-field">
                <label
                  htmlFor="checkout-postal-code"
                  style={{ display: 'block', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted, #7A6258)', marginBottom: '6px' }}
                >
                  PIN *
                </label>
                <input
                  id="checkout-postal-code"
                  name="postalCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={postalCode}
                  onChange={handlePinChange}
                  placeholder="110001"
                  aria-invalid={Boolean(pinError)}
                  aria-describedby={pinError ? "checkout-postal-code-error" : undefined}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: pinError
                      ? '1px solid #d32f2f'
                      : postalCode.length === 6
                      ? '1px solid var(--color-gold, #C5A265)'
                      : '1px solid var(--color-border-gold, #d8cbbe)',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                />
                {pinError && (
                  <span
                    id="checkout-postal-code-error"
                    role="alert"
                    style={{
                      display: 'block',
                      fontSize: '10px',
                      color: '#d32f2f',
                      marginTop: '4px',
                      lineHeight: 1.2,
                    }}
                  >
                    {pinError}
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-muted, #7A6258)', marginBottom: '6px' }}>
                Contact Phone for Insured Courier
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border-gold, #d8cbbe)',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Price Summary */}
            <div style={{
              backgroundColor: 'var(--color-cream, #F4EFE6)',
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '13px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-muted, #7A6258)' }}>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-muted, #7A6258)' }}>Express Insured Shipping</span>
                <span style={{ color: '#2e7d32', fontWeight: 600 }}>Complimentary</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '8px', marginTop: '8px' }}>
                <strong>Total Amount</strong>
                <strong style={{ fontSize: '16px', color: 'var(--color-burgundy, #5A121A)' }}>₹{total.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #5A121A 0%, #3D0C13 100%)',
                color: 'var(--color-cream-light, #fbf8f2)',
                border: '1px solid var(--color-gold, #C5A265)',
                padding: '14px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? 'Securing Transaction...' : (
                <>
                  <span>Pay ₹{total.toLocaleString('en-IN')} via Razorpay</span>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>(Test Mode)</span>
                </>
              )}
            </button>
            <p style={{ fontSize: '10px', color: 'var(--color-muted, #7A6258)', textAlign: 'center', marginTop: '10px' }}>
              🔒 256-bit encrypted checkout with server-side HMAC signature verification
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
