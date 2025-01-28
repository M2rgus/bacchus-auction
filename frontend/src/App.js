import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const ITEMS_PER_PAGE = 10;

const App = () => {
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [categories, setCategories] = useState([]);
  const [bidDetails, setBidDetails] = useState({ fullName: '', amount: '', productId: null, productName: '' });
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    if (filteredAuctions.length > 0) {
      const interval = setInterval(() => {
        updateRemainingTime();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [filteredAuctions]);

  const fetchAuctions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/auctions');
      const currentTime = Date.now();
  
      const activeAuctions = response.data.filter(auction => {
        const biddingEndTime = new Date(auction.biddingEndDate).getTime();
        return biddingEndTime > currentTime;
      });
  
      setAuctions(activeAuctions);
      setFilteredAuctions(activeAuctions);
      initializeRemainingTime(activeAuctions);
      extractCategories(activeAuctions);
    } catch (error) {
      console.error('Error fetching auctions:', error.message);
    }
  };
  

  const initializeRemainingTime = (auctions) => {
    const initialTimes = auctions.reduce((acc, auction) => {
      const endTime = new Date(auction.biddingEndDate).getTime();
      acc[auction.productId] = Math.max(0, endTime - Date.now());
      return acc;
    }, {});
    setTimeRemaining(initialTimes);
  };

  const extractCategories = (auctions) => {
    const uniqueCategories = [...new Set(auctions.map((auction) => auction.productCategory))];
    setCategories(uniqueCategories);
  };

  const updateRemainingTime = () => {
    setTimeRemaining((prev) => {
      const updatedTimes = { ...prev };
      Object.keys(updatedTimes).forEach((productId) => {
        updatedTimes[productId] = Math.max(0, updatedTimes[productId] - 1000);
      });
      return updatedTimes;
    });
  };

  const filterByCategory = (category) => {
    const filtered = auctions.filter((auction) => auction.productCategory === category);
    setFilteredAuctions(filtered);
    setCurrentPage(1);
  };

  const resetFilter = () => {
    setFilteredAuctions(auctions);
    setCurrentPage(1);
  };

  const openBidBox = (productId, productName) => {
    setBidDetails({ fullName: '', amount: '', productId, productName });
    document.body.classList.add('modal-open');
  };

  const closeBidBox = () => {
    setBidDetails({ fullName: '', amount: '', productId: null, productName: '' });
    document.body.classList.remove('modal-open');
    setMessage('');
  };

  const submitBid = async (e) => {
    e.preventDefault();
    if (!bidDetails.productId || parseFloat(bidDetails.amount) <= 0) {
      setMessage('Please enter a valid bid amount.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/bid', {
        fullName: bidDetails.fullName,
        amount: parseFloat(bidDetails.amount),
        productId: bidDetails.productId,
        productName: bidDetails.productName,
        currency: "EUR",
      });

      setMessage(response.data.message || 'Bid submitted successfully!');
      setTimeout(closeBidBox, 3000);
    } catch (error) {
      console.error('Error submitting bid:', error.message);
      setMessage('Failed to submit bid. Please try again.');
      setTimeout(closeBidBox, 3000);
    }
  };

  const formatTime = (ms) => {
    if (ms <= 0) return 'Expired';
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const totalPages = Math.ceil(filteredAuctions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayedAuctions = filteredAuctions.slice(startIndex, endIndex);

  return (
    <div>
      <h1>Bacchus Auctions</h1>
      <div className="filter-buttons">
      <button onClick={resetFilter}>Reset</button>
      {categories.map((category) => (
        <button key={category} onClick={() => filterByCategory(category)}>
          {category}
        </button>
      ))}
    </div>

      
      <div className="auction-grid">
        {displayedAuctions.map((auction, index) => (
          <div key={auction.productId} className="auction-item">
            <h3>{auction.productName}</h3>
            <p>{auction.productDescription}</p>
            <p>Category: {auction.productCategory}</p>
            <p>Time Remaining: {formatTime(timeRemaining[auction.productId] || 0)}</p>
            <button className="bid-button" onClick={() => openBidBox(auction.productId, auction.productName)}>
              Bid on this item
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
      
        <span className="page-number">Page {currentPage} of {totalPages}</span>
      
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
      )}

      {bidDetails.productId && (
        <div className="modal">
          <form onSubmit={submitBid}>
            <h2>Place Your Bid</h2>
            <p className="bid-item-title">Bidding on: <strong>{bidDetails.productName}</strong></p>
            <label>Full Name: <input type="text" name="fullName" value={bidDetails.fullName} onChange={(e) => setBidDetails({...bidDetails, fullName: e.target.value})} required /></label>
            <label>Bid Amount (€): <input type="number" name="amount" value={bidDetails.amount} onChange={(e) => setBidDetails({...bidDetails, amount: e.target.value})} required /></label>
            <button type="submit">Submit Bid</button>
            <button type="button" onClick={closeBidBox}>Cancel</button>
            <p>{message}</p>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
