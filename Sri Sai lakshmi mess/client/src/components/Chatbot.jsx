import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, ChevronDown, Bot, User } from 'lucide-react';
import { RESTAURANT_CONFIG } from '../data/restaurantData';

/* Daily Highlights — 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat */
const DAILY_HIGHLIGHTS = {
  0: { day: 'Sunday',    theme: 'Weekend Special Combo 🎉',     special: 'Weekend Grand Thali',     popular: 'Special Mutton Kuzhambu', vegSpecial: 'Ghee Pongal + Coconut Chutney', nonVegSpecial: 'Mutton Kuzhambu Rice',    bestSeller: 'Filter Coffee + Sweet Pongal Combo',     offer: '🎉 Sunday Special: Grand Thali + Payasam @ ₹130' },
  1: { day: 'Monday',    theme: 'South Indian Meals & Dosa Day 🍛', special: 'Full South Indian Meals', popular: 'Ghee Roast Dosa',         vegSpecial: 'Sambar Rice + Poriyal',         nonVegSpecial: 'Egg Curry Rice',          bestSeller: 'Ghee Roast Dosa with Sambar',            offer: '✨ Monday Freshness: Extra Appalam with every Meals!' },
  2: { day: 'Tuesday',   theme: 'Chicken Rice & Gravy Day 🍗',   special: 'Chicken Biryani',         popular: 'Chicken Gravy Rice',      vegSpecial: 'Onion Sambar Rice',             nonVegSpecial: 'Chicken Kuzhambu Rice',   bestSeller: 'Chicken Biryani with Raita',             offer: null },
  3: { day: 'Wednesday', theme: 'Onion Dosa & Egg Rice Day 🦚',  special: 'Egg Fried Rice',          popular: 'Onion Dosa',              vegSpecial: 'Curd Rice + Pickle',            nonVegSpecial: 'Egg Rice Combo',          bestSeller: 'Onion Dosa with Coconut Chutney',        offer: '🦚 Wednesday Combo: 2 Onion Dosas + Tea @ ₹55' },
  4: { day: 'Thursday',  theme: 'Parotta & Chicken Day 🫓',       special: 'Layered Parotta',         popular: 'Chicken 65',              vegSpecial: 'Veg Kuruma with Parotta',       nonVegSpecial: 'Chicken 65 + Parotta Combo', bestSeller: 'Parotta + Chicken Gravy',             offer: '🔥 Thursday Special: 3 Parottas + Chicken Gravy @ ₹110' },
  5: { day: 'Friday',    theme: 'Special Meals & Noodles Day 🍜', special: 'Special Friday Meals',    popular: 'Chicken Noodles',         vegSpecial: 'Lemon Rice + Podi Idli',        nonVegSpecial: 'Chicken Noodles',         bestSeller: 'Special Meals with Extra Sambar',        offer: '⭐ Friday Deal: Meals + Buttermilk FREE!' },
  6: { day: 'Saturday',  theme: 'Egg Dosa & Chicken Rice Day 🍳', special: 'Egg Dosa',                popular: 'Chicken Rice',            vegSpecial: 'Ven Pongal + Sambar',           nonVegSpecial: 'Chicken Rice with Raita', bestSeller: 'Egg Dosa + Filter Coffee Combo',         offer: '🍳 Saturday Spl: Egg Dosa + Vada @ ₹75' },
};

function getTodayHighlights() { return DAILY_HIGHLIGHTS[new Date().getDay()]; }

/* Knowledge Base */
const KB = {
  greetings: ['hi','hello','hey','vanakkam','namaste','good morning','good evening','good afternoon'],
  menu:      ['menu','food','dish','item','eat','idli','dosa','thali','meals','breakfast','lunch','dinner','poori','vada','coffee','tea','sambar','rasam','rice'],
  price:     ['price','cost','rate','charge','how much','fee','affordable','cheap','expensive'],
  hours:     ['time','hour','open','close','timing','when','schedule','available'],
  location:  ['location','address','where','place','direction','map','find','reach','sivakasi'],
  order:     ['order','book','reserve','bulk','pack','parcel','delivery','takeaway','take away'],
  contact:   ['contact','phone','call','number','whatsapp','email','reach out','talk'],
  thanks:    ['thank','thanks','ty','thank you','great','awesome','nice','perfect','helpful'],
  bye:       ['bye','goodbye','see you','cya','ok bye','exit','quit'],
  veg:       ['veg','vegetarian','non veg','nonveg','chicken','mutton','egg','fish'],
  special:   ['today special','today highlight','what is special today','today food','special today',"today's special","today's highlight",'daily special','what special'],
  catering:  ['catering','event','wedding','party','function','bulk order'],
  payment:   ['payment','pay','upi','cash','card','gpay','phonepay','paytm','online payment'],
  recommend: ['recommend','suggest','popular','best','famous','must try'],
};

const QUICK_REPLIES = [
  { label: '🔥 Today Highlights', message: 'today special' },
  { label: '🍽️ View Menu',      message: 'What is in your menu?' },
  { label: '⏰ Opening Hours',    message: 'What are your opening hours?' },
  { label: '📍 Location',       message: 'Where are you located?' },
  { label: '📦 Order Food',     message: 'How can I place an order?' },
  { label: '🎉 Catering',       message: 'Do you offer catering services?' },
];

/* Bot response engine */
function getBotResponse(input) {
  const text = input.toLowerCase().trim();

  if (KB.greetings.some(w => text.includes(w))) return {
    text: '🙏 Vanakkam! Welcome to Sri Sai Lakshmi Mess!\n\nI am Meena, your virtual food assistant.\n\n🔥 Try: today special, menu, hours, location!',
    suggestions: ['Today special', 'View menu', 'Opening hours'],
  };
  if (KB.bye.some(w => text.includes(w))) return {
    text: '👋 Thank you for visiting Sri Sai Lakshmi Mess! See you soon! 🍛',
  };
  if (KB.thanks.some(w => text.includes(w))) return {
    text: '😊 You are most welcome! Anything else? 🍽️',
    suggestions: ['Today special', 'View menu', 'Contact us'],
  };

  /* Today's Highlights */
  if (KB.special.some(w => text.includes(w))) {
    const h = getTodayHighlights();
    const offerLine = h.offer ? '\n\n🏷️ ' + h.offer : '';
    return {
      text: '🔥 Today is ' + h.day + ' — ' + h.theme +
        '\n\n🍛 Today\'s Special: '  + h.special +
        '\n🔥 Popular Dish: '          + h.popular +
        '\n🥗 Veg Special: '           + h.vegSpecial +
        '\n🍗 Non-Veg Special: '       + h.nonVegSpecial +
        '\n⭐ Best Seller: '               + h.bestSeller +
        offerLine + '\n\nCome visit us! 🙏',
      suggestions: ['Opening hours', 'Location', 'Place an order'],
    };
  }

  if (KB.catering.some(w => text.includes(w))) return {
    text: '🎉 Catering Services\n\nYes! We cater for:\n• 🏠 Family functions\n• 💒 Wedding receptions\n• 🏢 Corporate events\n• 🎂 Birthdays\n\nContact us:\n📞 ' + RESTAURANT_CONFIG.phone,
    suggestions: ['Contact us', 'View menu', 'Location'],
  };
  if (KB.menu.some(w => text.includes(w))) return {
    text: '🍛 Our Menu\n\n🌅 Breakfast\n• Idli & Sambar • Ghee Roast Dosa • Podi Idli\n• Medu Vada • Poori • Ghee Pongal\n\n☀️ Meals\n• South Indian Thali • Sambar Rice\n• Curd Rice • Lemon Rice\n\n☕ Beverages\n• Filter Coffee • Masala Tea • Buttermilk\n\nAll freshly made with pure ghee! 🙏',
    suggestions: ['Pricing', 'Opening hours', 'Place an order'],
  };
  if (KB.price.some(w => text.includes(w))) return {
    text: '💰 Pricing\n\n• Breakfast ₹20–₹60\n• Full Thali ₹80–₹120\n• Beverages ₹15–₹30\n\nCall for exact pricing:\n📞 ' + RESTAURANT_CONFIG.phone,
    suggestions: ['View menu', 'Opening hours', 'Location'],
  };
  if (KB.hours.some(w => text.includes(w))) return {
    text: '⏰ Opening Hours\n\n🕖 ' + RESTAURANT_CONFIG.openingHours + '\n\nOpen every day! 🙏\nBest: 8–10 AM breakfast, 12–2 PM thali lunch.',
    suggestions: ['View menu', 'Our location', 'Place an order'],
  };
  if (KB.location.some(w => text.includes(w))) return {
    text: '📍 Our Location\n\n' + RESTAURANT_CONFIG.address + '\n\n🗺️ Near Rathnavillas Bus Stop, Sivakasi.\nEasy to find near Balaji Complex! 😊',
    suggestions: ['Opening hours', 'Contact us', 'Online ordering'],
  };
  if (KB.order.some(w => text.includes(w))) return {
    text: '📦 How to Order\n\n🍽️ Dine In — Fresh food all day!\n📦 Parcel — Call: 📞 ' + RESTAURANT_CONFIG.phone + '\n🎉 Bulk/Catering — WhatsApp or call us!',
    suggestions: ['Contact us', 'Our location', 'Opening hours'],
  };
  if (KB.contact.some(w => text.includes(w))) return {
    text: '📞 Contact Us\n\n📱 Phone: ' + RESTAURANT_CONFIG.phone + '\n📧 Email: ' + RESTAURANT_CONFIG.email + '\n💬 WhatsApp: ' + RESTAURANT_CONFIG.phone + '\n\n📍 ' + RESTAURANT_CONFIG.address + '\n\nHappy to help! 🙏',
    suggestions: ['Opening hours', 'Location', 'Place an order'],
  };
  if (KB.veg.some(w => text.includes(w))) return {
    text: '🥗 Veg / Non-Veg Options\n\nAuthentic South Indian cuisine 🙏\n• Vegetarian breakfasts\n• Traditional thali meals\n• Non-veg specials on select days\n• Fresh beverages\n\nFor dietary queries: 📞 ' + RESTAURANT_CONFIG.phone,
    suggestions: ['Today special', 'View full menu', 'Pricing'],
  };
  if (KB.payment.some(w => text.includes(w))) return {
    text: '💳 Payment Options\n\n• 💵 Cash\n• 📱 UPI (GPay, PhonePe, Paytm)\n• 🔗 QR Code scan\n\nQueries: 📞 ' + RESTAURANT_CONFIG.phone,
    suggestions: ['View menu', 'Opening hours', 'Location'],
  };
  if (KB.recommend.some(w => text.includes(w))) return {
    text: '⭐ Our Recommendations\n\n• Grand South Indian Thali\n• Ghee Roast Dosa\n• Soft Podi Idli with coconut chutney\n• Kumbakonam Degree Filter Coffee\n\nAsk about today\'s special for the freshest picks!',
    suggestions: ['Today special', 'View full menu', 'Opening hours'],
  };
  return {
    text: '🤔 I can help you with:\n\n• 🔥 Today\'s Highlights\n• 🍛 Menu • ⏰ Hours • 📍 Location\n• 📦 How to order • 📞 Contact\n• 💰 Pricing • 🎉 Catering\n\nOr call: 📞 ' + RESTAURANT_CONFIG.phone,
    suggestions: ['Today special', 'View menu', 'Contact us'],
  };
}

/* Today's Highlights Card */
function TodaysHighlightsCard({ onAsk }) {
  const h = getTodayHighlights();
  return (
    <div className="highlights-card">
      <div className="highlights-card-header">
        <span className="highlights-fire">🔥</span>
        <span className="highlights-title">Today's Highlights</span>
        <span className="highlights-day-badge">{h.day}</span>
      </div>
      <p className="highlights-theme">{h.theme}</p>
      <div className="highlights-grid">
        <div className="highlight-item">
          <span className="highlight-icon">🍛</span>
          <div><span className="highlight-label">Today's Special</span><span className="highlight-value">{h.special}</span></div>
        </div>
        <div className="highlight-item">
          <span className="highlight-icon">🔥</span>
          <div><span className="highlight-label">Popular Dish</span><span className="highlight-value">{h.popular}</span></div>
        </div>
        <div className="highlight-item">
          <span className="highlight-icon">🥗</span>
          <div><span className="highlight-label">Veg Special</span><span className="highlight-value">{h.vegSpecial}</span></div>
        </div>
        <div className="highlight-item">
          <span className="highlight-icon">🍗</span>
          <div><span className="highlight-label">Non-Veg Special</span><span className="highlight-value">{h.nonVegSpecial}</span></div>
        </div>
        <div className="highlight-item highlight-item-full">
          <span className="highlight-icon">⭐</span>
          <div><span className="highlight-label">Best Seller</span><span className="highlight-value">{h.bestSeller}</span></div>
        </div>
      </div>
      {h.offer && <div className="highlights-offer">{h.offer}</div>}
      <button className="highlights-ask-btn" onClick={() => onAsk('today special')}>
        Ask Meena about today →
      </button>
    </div>
  );
}

function renderText(text) {
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
  ));
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{
    id: 1, from: 'bot',
    text: '🙏 Vanakkam! I am Meena, your Sri Sai Lakshmi Mess assistant!\n\nAsk me anything about our menu, timings, location, or how to order. How can I help you today?',
    time: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 200); }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput('');
    const userMsg = { id: Date.now(), from: 'user', text: userText, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      const response = getBotResponse(userText);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: 'bot',
        text: response.text, suggestions: response.suggestions, time: new Date(),
      }]);
      setIsTyping(false);
      if (!open) setUnread(u => u + 1);
    }, 700 + Math.random() * 400);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const formatTime = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <>
      <div className={`chatbot-window ${open ? 'chatbot-open' : ''}`} role="dialog" aria-label="Chat with Meena">
        <div className="chatbot-header">
          <div className="chatbot-avatar-wrap">
            <div className="chatbot-avatar"><Bot size={20} /></div>
            <div className="chatbot-online-dot" />
          </div>
          <div className="chatbot-header-info">
            <span className="chatbot-name">Meena</span>
            <span className="chatbot-status">Sri Sai Lakshmi Mess • Online</span>
          </div>
          <button className="chatbot-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
            <ChevronDown size={20} />
          </button>
        </div>

        <div className="chatbot-messages" id="chatbot-messages">
          <TodaysHighlightsCard onAsk={sendMessage} />
          {messages.length <= 1 && (
            <div className="chatbot-quick-starters">
              <p className="chatbot-quick-label">Quick questions:</p>
              <div className="chatbot-quick-grid">
                {QUICK_REPLIES.map((qr, i) => (
                  <button key={i} className="chatbot-quick-chip" onClick={() => sendMessage(qr.message)}>{qr.label}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`chatbot-msg-row ${msg.from === 'user' ? 'chatbot-msg-user' : 'chatbot-msg-bot'}`}>
              {msg.from === 'bot' && <div className="chatbot-msg-avatar"><Bot size={14} /></div>}
              <div className="chatbot-bubble-wrap">
                <div className={`chatbot-bubble ${msg.from === 'user' ? 'bubble-user' : 'bubble-bot'}`}>{renderText(msg.text)}</div>
                <span className="chatbot-msg-time">{formatTime(msg.time)}</span>
                {msg.suggestions && (
                  <div className="chatbot-suggestions">
                    {msg.suggestions.map((s, i) => (
                      <button key={i} className="chatbot-suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
              {msg.from === 'user' && <div className="chatbot-msg-avatar chatbot-user-avatar"><User size={14} /></div>}
            </div>
          ))}
          {isTyping && (
            <div className="chatbot-msg-row chatbot-msg-bot">
              <div className="chatbot-msg-avatar"><Bot size={14} /></div>
              <div className="chatbot-bubble bubble-bot chatbot-typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="chatbot-input-area">
          <input ref={inputRef} id="chatbot-input" className="chatbot-input" type="text"
            placeholder="Ask about menu, hours, today special..." value={input}
            onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            aria-label="Type your message" maxLength={300} />
          <button className={`chatbot-send-btn ${input.trim() ? 'active' : ''}`}
            onClick={() => sendMessage()} aria-label="Send message" disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>

      <button id="chatbot-trigger" className={`chatbot-trigger ${open ? 'chatbot-trigger-open' : ''}`}
        onClick={() => setOpen(o => !o)} aria-label="Open chat assistant" title="Chat with Meena">
        {open ? <X size={24} /> : <MessageSquare size={24} />}
        {!open && unread > 0 && <span className="chatbot-badge">{unread}</span>}
      </button>
    </>
  );
}
