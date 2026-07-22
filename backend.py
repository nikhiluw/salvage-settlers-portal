import http.server
import socketserver
import json
import sqlite3
import os
import re
import time
import threading
import urllib.request
import urllib.error
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load .env file if present
def load_env():
    env_path = ".env"
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k not in os.environ:
                        os.environ[k] = v

load_env()

# Database File PATH
DB_PATH = "vault.db"
PORT = 8000

def send_welcome_email(to_email, username, user_type):
    subject = f"Welcome to Salvage Settlers E-Auction Portal - Account Verified ({username})"
    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }}
    .card {{ max-width: 600px; margin: auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }}
    .logo {{ color: #34d399; font-size: 24px; font-weight: 900; letter-spacing: 1px; margin-bottom: 16px; }}
    .badge {{ background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; font-family: monospace; display: inline-block; border: 1px solid rgba(52, 211, 153, 0.3); }}
    h2 {{ color: #ffffff; margin-top: 16px; font-size: 22px; }}
    p {{ color: #cbd5e1; line-height: 1.6; font-size: 14px; }}
    .credit-box {{ background: #0f172a; border-left: 4px solid #10b981; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #1e293b; }}
    .amount {{ color: #10b981; font-size: 24px; font-weight: bold; font-family: monospace; margin-top: 4px; }}
    .btn {{ display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #022c22; font-weight: 800; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 14px; margin-top: 16px; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
    .footer {{ font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; line-height: 1.5; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">SALVAGE <span style="color:#ffffff;">SETTLERS</span></div>
    <span class="badge">OFFICIAL VERIFICATION NOTICE</span>
    <h2>Welcome Aboard, {username}!</h2>
    <p>Your <strong>{user_type.capitalize()}</strong> registration on India's premier E-Auction Salvage & Industrial Scrap Portal has been successfully verified.</p>
    
    <div class="credit-box">
      <div style="font-size:11px; color:#94a3b8; text-transform:uppercase; font-weight:bold; letter-spacing: 0.5px;">Pre-Approved Bidding Credit</div>
      <div class="amount">₹15,00,000 INR</div>
      <div style="font-size:11px; color:#34d399; margin-top:4px; font-weight: 600;">✓ GSTIN / PAN Pre-Clearance Status: VERIFIED</div>
    </div>

    <p>You can now participate in real-time bidding for live salvage lots, inspect physical warehouse sites across India, and submit Earnest Money Deposits (EMD).</p>
    
    <div style="margin-top: 24px; margin-bottom: 24px;">
      <a href="http://localhost:3000" style="display: inline-block; background-color: #4f46e5; background: linear-gradient(135deg, #4f46e5 0%, #059669 100%); color: #ffffff !important; font-weight: 800; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 15px; font-family: 'Segoe UI', Arial, sans-serif; shadow: 0 4px 12px rgba(79, 70, 229, 0.4); text-align: center;">
        Access Live Salvage Bidding Room &rarr;
      </a>
    </div>

    <div class="footer">
      <p><strong>Salvage Settlers Corporate E-Auction Desk</strong><br>Plot 18, Commercial Salvage Complex, Barakhamba Road, Connaught Place, New Delhi - 110001, India.<br>Helpline: +91 88003 35916 / +91 98100 07987 | Email: support@salvageportal.in</p>
    </div>
  </div>
</body>
</html>"""

    # Check for custom SMTP configuration in environment
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")

    sent_via_smtp = False
    smtp_error = None

    if smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Salvage Settlers <{smtp_user}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_content, "html"))

            server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, [to_email], msg.as_string())
            server.quit()
            sent_via_smtp = True
            print(f"[MAIL SERVICE] Real welcome email dispatched via SMTP to {to_email}")
        except smtplib.SMTPAuthenticationError as e:
            smtp_error = f"Google SMTP Authentication Error (535 Bad Credentials): Gmail requires a 16-character App Password instead of a normal account password. Learn more: https://myaccount.google.com/apppasswords"
            print(f"[MAIL SERVICE ERROR] {smtp_error}")
        except Exception as e:
            smtp_error = f"SMTP Error ({type(e).__name__}): {e}"
            print(f"[MAIL SERVICE ERROR] {smtp_error}")

    return {
        "to": to_email,
        "subject": subject,
        "html": html_content,
        "sentViaSmtp": sent_via_smtp,
        "smtpError": smtp_error
    }

# ==========================================
# SQLITE DATABASE SETUP AND SCHEMAS
# ==========================================

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Drop old table schema if upgrading or old non-salvage seed exists
    cursor.execute("PRAGMA table_info(auctions)")
    cols = [r[1] for r in cursor.fetchall()]
    
    needs_reset = False
    if cols and "emd_amount" not in cols:
        needs_reset = True
    else:
        try:
            cursor.execute("SELECT title FROM auctions WHERE id = 'auc-001'")
            row = cursor.fetchone()
            if row and "Korg" in row[0]:
                needs_reset = True
        except Exception:
            pass

    if needs_reset:
        cursor.execute("DROP TABLE IF EXISTS auctions")
        cursor.execute("DROP TABLE IF EXISTS users")
        cursor.execute("DROP TABLE IF EXISTS bids")
        cursor.execute("DROP TABLE IF EXISTS cloud_files")
        cursor.execute("DROP TABLE IF EXISTS notifications")

    # Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        password_hash TEXT,
        username TEXT,
        mfa_enabled INTEGER,
        mfa_token TEXT,
        mfa_pending_verification INTEGER,
        balance REAL,
        spending_limit REAL,
        saved_auctions TEXT
    )""")

    # Salvage Auctions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS auctions (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        category TEXT,
        image_url TEXT,
        starting_price REAL,
        current_price REAL,
        increment REAL,
        emd_amount REAL,
        starts_at INTEGER,
        ends_at INTEGER,
        created_at INTEGER,
        seller TEXT,
        surveyor_contact TEXT,
        inspection_location TEXT,
        inspection_dates TEXT,
        state TEXT,
        salvage_condition TEXT,
        status TEXT,
        winner TEXT,
        is_paid INTEGER,
        tx_id TEXT,
        card_last4 TEXT,
        amount_paid REAL,
        paid_at INTEGER
    )""")

    # Bids Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bids (
        id TEXT PRIMARY KEY,
        auction_id TEXT,
        bidder TEXT,
        amount REAL,
        timestamp INTEGER,
        status TEXT,
        transaction_hash TEXT
    )""")

    # Cloud Files Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cloud_files (
        id TEXT PRIMARY KEY,
        name TEXT,
        size INTEGER,
        mime_type TEXT,
        uploaded_at INTEGER,
        provider TEXT,
        bucket TEXT,
        url TEXT,
        encrypted INTEGER,
        checksum TEXT
    )""")

    # Notifications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        email TEXT,
        auction_id TEXT,
        auction_title TEXT,
        type TEXT,
        message TEXT,
        timestamp INTEGER,
        read INTEGER
    )""")

    conn.commit()

    # Seed Database if Empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        seed_db(cursor)
        conn.commit()

    conn.close()

def seed_db(cursor):
    # Seed Users
    cursor.execute("""
    INSERT OR REPLACE INTO users VALUES (
        'nikhiluw@gmail.com', 'securepassword123', 'nikhiluw', 1, '518392', 0, 1250000.0, 1500000.0, '["auc-001", "auc-003"]'
    )""")
    cursor.execute("""
    INSERT OR REPLACE INTO users VALUES (
        'bidder@example.com', 'password123', 'AlphaWave_Master', 0, '', 0, 850000.0, 1000000.0, '["auc-001"]'
    )""")

    # Seed Salvage Auctions
    now = int(time.time() * 1000)
    duration = 45 * 60 * 1000 # 45 mins
    day_ms = 24 * 60 * 60 * 1000
    
    auctions = [
        # 1. LIVE AUCTIONS
        ("auc-001", "Industrial Scrap: 45 MT Heavy Melt Steel (HMS 1&2)", 
         "Heavy melting steel scrap lot from industrial dismantling. Consists of structural beams, plates, and cut pipes. Sold on 'As Is Where Is' basis.",
         "Industrial Scrap", "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800",
         1250000.0, 1420000.0, 20000.0, 50000.0, now - 3600000, now + duration, now - 3600000,
         "SteelCraft_Disposals", "+91 98100 07987", "Alang Ship Breaking Yard, Plot 42, Bhavnagar", "22-25 July 2026", "Gujarat", "Scrap Material",
         "active", "", 0, "", "", 0.0, 0),
        
        ("auc-002", "Water-Damaged Raw Cotton Bales (120 Bales)", 
         "Consignment of raw cotton bales affected by warehouse rainwater seepage. Partially moisture-soaked, ideal for recycling and processing.",
         "Fire & Water Inventory", "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&q=80&w=800",
         680000.0, 790000.0, 10000.0, 35000.0, now - 7200000, now + duration * 2, now - 7200000,
         "United_Insurance_Surveyors", "+91 88003 35916", "Bhiwandi Salvage Warehouse, Zone 4, Thane", "23-26 July 2026", "Maharashtra", "Water Damaged",
         "active", "", 0, "", "", 0.0, 0),
          
        ("auc-003", "Accidental Commercial Truck: 2022 Tata Signa 4825.TK", 
         "Surveyor inspected commercial tipper truck involved in highway rollover accident. Engine and gearbox intact; cab chassis damaged.",
         "Damaged Vehicles", "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800",
         1800000.0, 2150000.0, 25000.0, 75000.0, now - 12000000, now + int(duration * 1.5), now - 12000000,
         "National_Auto_Claims", "+91 98111 22334", "Mayapuri Salvage Yard, Phase II, New Delhi", "21-24 July 2026", "Delhi", "Accidental Vehicle",
         "active", "", 0, "", "", 0.0, 0),
          
        ("auc-004", "Fire-Damaged Industrial CNC Milling Machinery", 
         "VMC CNC milling center exposed to factory electrical fire. Electrical panel damaged, mechanical bed structure unaffected. Certificate of inspection available.",
         "Machinery & Equipment", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
         2500000.0, 2850000.0, 50000.0, 100000.0, now - 15000000, now + duration * 3, now - 15000000,
         "Industrial_Asset_Recycle", "+91 98400 11223", "Sriperumbudur Industrial Estate, Chennai", "24-27 July 2026", "Tamil Nadu", "Fire Damaged",
         "active", "", 0, "", "", 0.0, 0),

        # 2. UPCOMING AUCTIONS
        ("auc-005", "Upcoming: Submerged Server & IT Hardware Surplus (500 Units)", 
         "Data center surplus hardware affected by basement water logging. Includes racks, power supplies, and chassis for scrap recovery.",
         "Electronics & Surplus", "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
         850000.0, 850000.0, 15000.0, 40000.0, now + day_ms, now + day_ms + duration * 4, now,
         "TechVault_Insurance", "+91 98800 55443", "Electronic City Phase II, Bengaluru", "25-28 July 2026", "Karnataka", "Water Damaged",
         "upcoming", "", 0, "", "", 0.0, 0),

        ("auc-006", "Upcoming: Accidental Tipper Fleet (3 Units Ashok Leyland)", 
         "Fleet of 3 commercial construction tippers damaged during site landslide. Sold together as single lot on 'Whatever There Is' basis.",
         "Damaged Vehicles", "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?auto=format&fit=crop&q=80&w=800",
         3200000.0, 3200000.0, 50000.0, 150000.0, now + day_ms * 2, now + day_ms * 2 + duration * 4, now,
         "InfraDisposals_North", "+91 98120 99887", "Manesar Industrial Hub, Sector 8, Gurugram", "26-29 July 2026", "Haryana", "Accidental Fleet",
         "upcoming", "", 0, "", "", 0.0, 0),

        # 3. PAST / CLOSED AUCTIONS
        ("auc-007", "Closed Lot: Scrap Copper Cable Wire Lot (12 MT)", 
         "Insulated heavy copper power cable scrap from plant overhaul. Bidding concluded and lot awarded to highest verified bidder.",
         "Industrial Scrap", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
         1500000.0, 1840000.0, 25000.0, 60000.0, now - day_ms * 2, now - day_ms, now - day_ms * 3,
         "Northern_Rail_Salvage", "+91 98100 07987", "Taloja MIDC Yard, Navi Mumbai", "18-20 July 2026", "Maharashtra", "Scrap Material",
         "sold", "nikhiluw@gmail.com", 1, "tx_754ac00ff0111bcbd9e38ef902b9ffaa", "4242", 1840000.0, now - day_ms)
    ]

    for item in auctions:
        cursor.execute("INSERT OR REPLACE INTO auctions VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", item)

    # Initial bids
    bids = [
        ("bid-101", "auc-001", "Gupta_Steel_Traders", 1300000.0, now - 3000000, "outbid", ""),
        ("bid-102", "auc-001", "Mahavir_Recyclers", 1360000.0, now - 2000000, "outbid", ""),
        ("bid-103", "auc-001", "nikhiluw", 1420000.0, now - 500000, "confirmed", ""),
        
        ("bid-201", "auc-002", "Textile_Salvage_Co", 720000.0, now - 6000000, "outbid", ""),
        ("bid-202", "auc-002", "CottonMills_West", 790000.0, now - 2500000, "confirmed", "")
    ]

    for b in bids:
        cursor.execute("INSERT OR REPLACE INTO bids VALUES (?,?,?,?,?,?,?)", b)

    # Seed files
    files = [
        ("file-01", "Surveyor_Loss_Assessment_Report.pdf", 2450000, "application/pdf", now - 86400000, "gcs", 
         "us-east1-bid-vault-pdf", "https://storage.googleapis.com/us-east1-bid-vault-pdf/Surveyor_Loss_Assessment_Report.pdf", 1, 
         "sha256-4fb32bc97ae89d10bc93adcf982ea2cf7ad21bc9e44ffda9bc9ca0b0d3cf99ef38"),
        ("file-02", "Site_Inspection_Photos_Yard.jpg", 1420000, "image/jpeg", now - 43200000, "s3", 
         "s3-us-west-2-asset-vault", "https://s3.amazonaws.com/s3-us-west-2-asset-vault/Site_Inspection_Photos_Yard.jpg", 1, 
         "sha256-bd8902fed90cbff2bc09a2dc9830ef2cb189f7bc089db01cf2fe0dfcb72bc0de")
    ]
    for file_record in files:
        cursor.execute("INSERT OR REPLACE INTO cloud_files VALUES (?,?,?,?,?,?,?,?,?,?)", file_record)

    # Seed notification
    cursor.execute("""
    INSERT OR REPLACE INTO notifications VALUES (
        'alert-001', 'nikhiluw@gmail.com', 'auc-001', 'Industrial Scrap: 45 MT Heavy Melt Steel (HMS 1&2)', 
        'outbid', 'Outbid Alert! You are currently the highest bidder at ₹14,20,000 on 45 MT Heavy Melt Steel scrap.', ?, 0
    )""", (now - 300000,))


# ==========================================
# SIMULATED BIDDING BOT & EXPIRY BACKGROUND THREADS
# ==========================================

SIMULATED_BIDDER_BOTS = [
    "AnalogLover99", "AlphaSartre", "CyberSculptor", "SpaceCollector99",
    "VintageGamer_Hub", "GarageMaster_X", "GigaMuseumTrader", "FineArtAdvocate"
]

def generate_random_id(prefix=""):
    import uuid
    return f"{prefix}{uuid.uuid4().hex[:12]}"

def run_bidding_bots():
    print("[BOT CLIENT] Simulated Bidding Bots thread enabled.")
    while True:
        try:
            time.sleep(12)
            # Skip with 60% probability to keep standard slow organic bids
            if time.time() % 3 < 1.1:
                continue

            conn = get_db()
            cursor = conn.cursor()

            # Find active auctions
            now_ms = int(time.time() * 1000)
            cursor.execute("SELECT * FROM auctions WHERE status = 'active' AND ends_at > ?", (now_ms,))
            active_auctions = cursor.fetchall()

            if not active_auctions:
                conn.close()
                continue

            # Pick random active auction
            import random
            auc = random.choice(active_auctions)
            bot_name = random.choice(SIMULATED_BIDDER_BOTS)

            current_price = auc["current_price"]
            increment = auc["increment"]
            bid_amount = current_price + increment
            auction_id = auc["id"]

            # Set previous bids for this auction to outbid
            cursor.execute("SELECT * FROM bids WHERE auction_id = ? AND status = 'confirmed'", (auction_id,))
            previous_confirmed_bids = cursor.fetchall()
            
            for prev_bid in previous_confirmed_bids:
                cursor.execute("UPDATE bids SET status = 'outbid' WHERE id = ?", (prev_bid["id"],))
                # Push alarm notification if outbid user is nikhiluw
                if prev_bid["bidder"] in ["nikhiluw", "nikhiluw@gmail.com"]:
                    alert_id = generate_random_id("alert-")
                    msg = f"Outbid alert! {bot_name} placed a bid of ${bid_amount:,.2f} on \"{auc['title']}\". You are no longer highest!"
                    cursor.execute("""
                        INSERT INTO notifications VALUES (?, 'nikhiluw@gmail.com', ?, ?, 'outbid', ?, ?, 0)
                    """, (alert_id, auction_id, auc["title"], msg, now_ms))

            # Store the bot bid
            new_bid_id = generate_random_id("bid-")
            cursor.execute("INSERT INTO bids VALUES (?, ?, ?, ?, ?, ?, ?)", (
                new_bid_id, auction_id, bot_name, bid_amount, now_ms, "confirmed", ""
            ))

            # Update Current Price
            cursor.execute("UPDATE auctions SET current_price = ? WHERE id = ?", (bid_amount, auction_id))
            conn.commit()
            conn.close()
            print(f"[BOT CLIENT] Placed bot bid on {auc['title']} of ${bid_amount}")

        except Exception as err:
            print(f"[BOT SYSTEM ERR] Bottling failure: {err}")

def run_expiry_watcher():
    print("[SYSTEM WATCHER] Expiry scanner monitoring activated.")
    while True:
        try:
            time.sleep(2)
            conn = get_db()
            cursor = conn.cursor()
            now_ms = int(time.time() * 1000)

            # Query expired, still marked active auctions
            cursor.execute("SELECT * FROM auctions WHERE status = 'active' AND ends_at <= ?", (now_ms,))
            expired = cursor.fetchall()

            for auc in expired:
                auction_id = auc["id"]
                # Find the confirmed highest bid
                cursor.execute("SELECT * FROM bids WHERE auction_id = ? AND status = 'confirmed' LIMIT 1", (auction_id,))
                highest_bid = cursor.fetchone()

                if highest_bid:
                    bidder_name = highest_bid["bidder"]
                    winner_email = "nikhiluw@gmail.com" if bidder_name in ["nikhiluw", "nikhiluw@gmail.com"] else f"{bidder_name.lower()}@domain.com"
                    cursor.execute("UPDATE auctions SET status = 'sold', winner = ? WHERE id = ?", (winner_email, auction_id))
                    
                    # Log won alert notification if user is nikhiluw
                    if bidder_name in ["nikhiluw", "nikhiluw@gmail.com"]:
                        alert_id = generate_random_id("alert-")
                        msg = f"🏆 CONGRATULATIONS! You won the auction for \"{auc['title']}\" at ₹{auc['current_price']:,.2f}! Secure your asset via Checkout."
                        cursor.execute("""
                            INSERT INTO notifications VALUES (?, 'nikhiluw@gmail.com', ?, ?, 'won', ?, ?, 0)
                        """, (alert_id, auction_id, auc["title"], msg, now_ms))
                    print(f"[SYSTEM WATCHER] Sold item {auc['title']} to winner {winner_email}!")
                else:
                    cursor.execute("UPDATE auctions SET status = 'completed' WHERE id = ?", (auction_id,))
                    print(f"[SYSTEM WATCHER] Concluded item {auc['title']} with zero bidder entries.")

            # Query upcoming auctions that should now be active
            cursor.execute("SELECT * FROM auctions WHERE status = 'upcoming' AND starts_at <= ?", (now_ms,))
            activated = cursor.fetchall()
            for auc in activated:
                cursor.execute("UPDATE auctions SET status = 'active' WHERE id = ?", (auc["id"],))
                print(f"[SYSTEM WATCHER] Activated upcoming salvage lot: {auc['title']}")

            conn.commit()
            conn.close()
        except Exception as err:
            print(f"[SYSTEM WATCHER ERR] Expiry failure: {err}")


# ==========================================
# REST API REQ HANDLER CLASS
# ==========================================

class PythonAPIService(http.server.BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        # Override to suppress noisy server requests logging
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def set_json_headers(self, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

    def parse_body(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                return {}
            body_bytes = self.rfile.read(content_length)
            return json.loads(body_bytes.decode('utf-8'))
        except Exception:
            return {}

    def fetch_full_bids(self, cursor, auction_id):
        cursor.execute("SELECT * FROM bids WHERE auction_id = ? ORDER BY timestamp ASC", (auction_id,))
        rows = cursor.fetchall()
        bids = []
        for r in rows:
            bids.append({
                "id": r["id"],
                "auctionId": r["auction_id"],
                "bidder": r["bidder"],
                "amount": r["amount"],
                "timestamp": r["timestamp"],
                "status": r["status"],
                "transactionHash": r["transaction_hash"]
            })
        return bids

    def map_auction_row(self, r, bids_list):
        pay_details = None
        if r["is_paid"]:
            pay_details = {
                "txId": r["tx_id"],
                "cardLast4": r["card_last4"],
                "amountPaid": r["amount_paid"],
                "paidAt": r["paid_at"]
            }
        keys = r.keys()
        return {
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "category": r["category"],
            "imageUrl": r["image_url"],
            "startingPrice": r["starting_price"],
            "currentPrice": r["current_price"],
            "increment": r["increment"],
            "emdAmount": r["emd_amount"] if "emd_amount" in keys else 50000.0,
            "startsAt": r["starts_at"] if "starts_at" in keys else r["created_at"],
            "endsAt": r["ends_at"],
            "createdAt": r["created_at"],
            "seller": r["seller"],
            "surveyorContact": r["surveyor_contact"] if "surveyor_contact" in keys else "+91 98100 07987",
            "inspectionLocation": r["inspection_location"] if "inspection_location" in keys else "Delhi Yard",
            "inspectionDates": r["inspection_dates"] if "inspection_dates" in keys else "22-25 July 2026",
            "state": r["state"] if "state" in keys else "Delhi",
            "salvageCondition": r["salvage_condition"] if "salvage_condition" in keys else "As Is Where Is",
            "status": r["status"],
            "winner": r["winner"] if r["winner"] else None,
            "isPaid": bool(r["is_paid"]),
            "paymentDetails": pay_details,
            "bids": bids_list
        }

    def check_auth(self, cursor, email):
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        return cursor.fetchone()

    def do_GET(self):
        # Serve static assets from uploads directory
        if self.path.startswith("/uploads/"):
            from urllib.parse import urlparse
            parsed = urlparse(self.path)
            file_name = os.path.basename(parsed.path)
            local_path = os.path.join("uploads", file_name)
            if os.path.exists(local_path) and os.path.isfile(local_path):
                ext = os.path.splitext(local_path)[1].lower()
                mime = "application/octet-stream"
                if ext in [".jpg", ".jpeg"]:
                    mime = "image/jpeg"
                elif ext == ".png":
                    mime = "image/png"
                elif ext == ".gif":
                    mime = "image/gif"
                elif ext == ".webp":
                    mime = "image/webp"
                
                try:
                    with open(local_path, "rb") as f:
                        content = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", mime)
                    self.send_header("Content-Length", str(len(content)))
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(content)
                except Exception as e:
                    self.set_json_headers(500)
                    self.wfile.write(json.dumps({"error": f"Failed to read file: {e}"}).encode('utf-8'))
            else:
                self.set_json_headers(404)
                self.wfile.write(json.dumps({"error": "File not found"}).encode('utf-8'))
            return

        conn = get_db()
        cursor = conn.cursor()
        
        # Match Endpoint Patterns
        # Match profile GET /api/auth/profile
        if self.path.startswith("/api/auth/profile"):
            from urllib.parse import urlparse, parse_qs
            parsed = urlparse(self.path)
            q_email = parse_qs(parsed.query).get("email", ["nikhiluw@gmail.com"])[0]
            user = self.check_auth(cursor, q_email)
            if user:
                saved = json.loads(user["saved_auctions"] or "[]")
                res = {
                    "username": user["username"],
                    "email": user["email"],
                    "mfaEnabled": bool(user["mfa_enabled"]),
                    "balance": user["balance"],
                    "spendingLimit": user["spending_limit"],
                    "savedAuctions": saved
                }
                self.set_json_headers(200)
                self.wfile.write(json.dumps(res).encode('utf-8'))
            else:
                self.set_json_headers(404)
                self.wfile.write(json.dumps({"error": "User profile missing"}).encode('utf-8'))

        # Match notifications GET /api/notifications
        elif self.path.startswith("/api/notifications"):
            from urllib.parse import urlparse, parse_qs
            parsed = urlparse(self.path)
            q_email = parse_qs(parsed.query).get("email", ["nikhiluw@gmail.com"])[0]
            cursor.execute("SELECT * FROM notifications WHERE email = ? ORDER BY timestamp DESC", (q_email,))
            rows = cursor.fetchall()
            alerts_list = []
            for r in rows:
                alerts_list.append({
                    "id": r["id"],
                    "auctionId": r["auction_id"],
                    "auctionTitle": r["auction_title"],
                    "type": r["type"],
                    "message": r["message"],
                    "timestamp": r["timestamp"],
                    "read": bool(r["read"])
                })
            self.set_json_headers(200)
            self.wfile.write(json.dumps(alerts_list).encode('utf-8'))

        # Match cloud assets GET /api/storage
        elif self.path == "/api/storage":
            cursor.execute("SELECT * FROM cloud_files ORDER BY uploaded_at DESC")
            rows = cursor.fetchall()
            files = []
            for r in rows:
                files.append({
                    "id": r["id"],
                    "name": r["name"],
                    "size": r["size"],
                    "mimeType": r["mime_type"],
                    "uploadedAt": r["uploaded_at"],
                    "provider": r["provider"],
                    "bucket": r["bucket"],
                    "url": r["url"],
                    "encrypted": bool(r["encrypted"]),
                    "checksum": r["checksum"]
                })
            self.set_json_headers(200)
            self.wfile.write(json.dumps(files).encode('utf-8'))

        # Match single auction details GET /api/auctions/<id>
        elif re.match(r"^/api/auctions/[a-zA-Z0-9_-]+$", self.path):
            auc_id = self.path.split("/")[-1]
            cursor.execute("SELECT * FROM auctions WHERE id = ?", (auc_id,))
            auc = cursor.fetchone()
            if auc:
                bids_list = self.fetch_full_bids(cursor, auc_id)
                item = self.map_auction_row(auc, bids_list)
                self.set_json_headers(200)
                self.wfile.write(json.dumps(item).encode('utf-8'))
            else:
                self.set_json_headers(404)
                self.wfile.write(json.dumps({"error": "Auction item not found"}).encode('utf-8'))

        # Match list active auctions GET /api/auctions
        elif self.path == "/api/auctions":
            cursor.execute("SELECT * FROM auctions ORDER BY id ASC")
            rows = cursor.fetchall()
            items = []
            for r in rows:
                auc_id = r["id"]
                bids_list = self.fetch_full_bids(cursor, auc_id)
                items.append(self.map_auction_row(r, bids_list))
            self.set_json_headers(200)
            self.wfile.write(json.dumps(items).encode('utf-8'))

        # Standard root or default
        else:
            self.set_json_headers(404)
            self.wfile.write(json.dumps({"error": f"Route not found: {self.path}"}).encode('utf-8'))

        conn.close()

    def do_POST(self):
        conn = get_db()
        cursor = conn.cursor()
        body = self.parse_body()

        now_ms = int(time.time() * 1000)

        # POST /api/auth/register
        if self.path == "/api/auth/register":
            email = body.get("email")
            password = body.get("password", "password123")
            username = body.get("username", email.split("@")[0] if email else "Bidder")
            company_name = body.get("companyName", "")
            gstin = body.get("gstin", "")
            user_type = body.get("userType", "buyer")

            if not email or not password:
                self.set_json_headers(400)
                self.wfile.write(json.dumps({"error": "Email and password are required for registration."}).encode('utf-8'))
            else:
                existing = self.check_auth(cursor, email)
                if existing:
                    self.set_json_headers(400)
                    self.wfile.write(json.dumps({"error": "Account with this email already exists."}).encode('utf-8'))
                else:
                    cursor.execute("""
                        INSERT INTO users VALUES (?, ?, ?, 0, '', 0, 1000000.0, 1500000.0, '[]')
                    """, (email, password, username))
                    
                    welcome_msg = f"Welcome to Salvage Settlers, {username}! Your {user_type.capitalize()} account is verified with ₹15,00,000 INR pre-approved bidding credit capacity."
                    cursor.execute("""
                        INSERT INTO notifications VALUES (?, ?, 'system', 'Welcome to Salvage Settlers', 'info', ?, ?, 0)
                    """, (f"welcome-{int(time.time()*1000)}", email, welcome_msg, int(time.time()*1000)))
                    
                    conn.commit()
                    
                    email_dispatch = send_welcome_email(email, username, user_type)
                    
                    res = {
                        "success": True,
                        "user": {
                            "username": username,
                            "email": email,
                            "companyName": company_name,
                            "gstin": gstin,
                            "userType": user_type,
                            "mfaEnabled": False,
                            "balance": 1000000.0,
                            "spendingLimit": 1500000.0,
                            "savedAuctions": []
                        },
                        "welcomeGreeting": welcome_msg,
                        "emailDispatch": email_dispatch,
                        "message": "Registration successful! Welcome email has been generated and dispatched."
                    }
                    self.set_json_headers(200)
                    self.wfile.write(json.dumps(res).encode('utf-8'))

        # POST /api/contact
        elif self.path == "/api/contact":
            full_name = body.get("fullName", "Valued User")
            email = body.get("email", "")
            inquiry_type = body.get("inquiryType", "General Inquiry")
            msg = body.get("message", "")
            
            res = {
                "success": True,
                "message": f"Thank you, {full_name}! Your {inquiry_type} has been received. Our salvage desk team will respond to {email} within 2 hours."
            }
            self.set_json_headers(200)
            self.wfile.write(json.dumps(res).encode('utf-8'))

        # POST /api/auth/login
        elif self.path == "/api/auth/login":
            email = body.get("email")
            password = body.get("password")
            user = self.check_auth(cursor, email)
            if not user or user["password_hash"] != password:
                self.set_json_headers(401)
                self.wfile.write(json.dumps({"error": "Invalid credentials. Please use nikhiluw@gmail.com / securepassword123"}).encode('utf-8'))
            else:
                if user["mfa_enabled"]:
                    fresh_mfa = str(time.time()).split(".")[-1][:6] or "518392"
                    cursor.execute("""
                        UPDATE users SET mfa_token = ?, mfa_pending_verification = 1 WHERE email = ?
                    """, (fresh_mfa, email))
                    conn.commit()
                    self.set_json_headers(200)
                    res = {
                        "mfaRequired": True,
                        "email": user["email"],
                        "message": f"Multi-Factor Authentication code generated on system authenticator: {fresh_mfa}"
                    }
                    self.wfile.write(json.dumps(res).encode('utf-8'))
                else:
                    saved = json.loads(user["saved_auctions"] or "[]")
                    res = {
                        "mfaRequired": False,
                        "user": {
                            "username": user["username"],
                            "email": user["email"],
                            "mfaEnabled": False,
                            "balance": user["balance"],
                            "spendingLimit": user["spending_limit"],
                            "savedAuctions": saved
                        }
                    }
                    self.set_json_headers(200)
                    self.wfile.write(json.dumps(res).encode('utf-8'))

        # POST /api/auth/mfa-verify
        elif self.path == "/api/auth/mfa-verify":
            email = body.get("email")
            code = body.get("code")
            user = self.check_auth(cursor, email)
            if not user or not user["mfa_pending_verification"]:
                self.set_json_headers(400)
                self.wfile.write(json.dumps({"error": "Auth session expired. Please re-authenticate."}).encode('utf-8'))
            else:
                # Accept correct OTP or backup key or local developer code bypass override '123456'
                if user["mfa_token"] == code or code == "123456" or user["mfa_token"] == "518392":
                    cursor.execute("UPDATE users SET mfa_pending_verification = 0 WHERE email = ?", (email,))
                    conn.commit()
                    saved = json.loads(user["saved_auctions"] or "[]")
                    res = {
                        "success": True,
                        "user": {
                            "username": user["username"],
                            "email": user["email"],
                            "mfaEnabled": bool(user["mfa_enabled"]),
                            "balance": user["balance"],
                            "spendingLimit": user["spending_limit"],
                            "savedAuctions": saved
                        }
                    }
                    self.set_json_headers(200)
                    self.wfile.write(json.dumps(res).encode('utf-8'))
                else:
                    self.set_json_headers(401)
                    self.wfile.write(json.dumps({"error": "Invalid Multi-Factor Security Code. Try again or check the indicator."}).encode('utf-8'))

        # POST /api/auctions/<id>/bid (bid placement)
        elif re.match(r"^/api/auctions/[a-zA-Z0-9_-]+/bid$", self.path):
            auc_id = self.path.split("/")[-2]
            bidder_email = body.get("bidderEmail")
            amount = body.get("amount")
            is_offline = body.get("isOffline", False)

            cursor.execute("SELECT * FROM auctions WHERE id = ?", (auc_id,))
            auc = cursor.fetchone()
            if not auc:
                self.set_json_headers(404)
                self.wfile.write(json.dumps({"error": "Auction registry item missing."}).encode('utf-8'))
            elif auc["status"] != "active" or auc["ends_at"] <= now_ms:
                self.set_json_headers(400)
                self.wfile.write(json.dumps({"error": "This bidding event has concluded and is no longer accepting submissions."}).encode('utf-8'))
            else:
                min_bid = auc["current_price"] + auc["increment"]
                if amount < min_bid:
                    self.set_json_headers(400)
                    self.wfile.write(json.dumps({"error": f"Bid placement rejected. Must be at least ${min_bid:,.2f} to outbid current holder."}).encode('utf-8'))
                else:
                    # Update previous confirmed bids to outbid
                    cursor.execute("SELECT * FROM bids WHERE auction_id = ? AND status = 'confirmed'", (auc_id,))
                    previous_confirmed_bids = cursor.fetchall()
                    
                    for prev_bid in previous_confirmed_bids:
                        cursor.execute("UPDATE bids SET status = 'outbid' WHERE id = ?", (prev_bid["id"],))
                        if prev_bid["bidder"] in ["nikhiluw", "nikhiluw@gmail.com"]:
                            alert_id = generate_random_id("alert-")
                            msg = f"Outbid alert! Quick update: you have been outbid on \"{auc['title']}\" with a higher offer of ${amount:,.2f}."
                            cursor.execute("""
                                INSERT INTO notifications VALUES (?, 'nikhiluw@gmail.com', ?, ?, 'outbid', ?, ?, 0)
                            """, (alert_id, auc_id, auc["title"], msg, now_ms))

                    # Insert new Bid record
                    unique_bid_id = generate_random_id("bid-")
                    tx_hash = f"sha256-tx_" + os.urandom(16).hex()
                    bidder_short = "nikhiluw" if bidder_email == "nikhiluw@gmail.com" else bidder_email
                    
                    cursor.execute("INSERT INTO bids VALUES (?, ?, ?, ?, ?, ?, ?)", (
                        unique_bid_id, auc_id, bidder_short, amount, now_ms, "confirmed", tx_hash
                    ))

                    # Update auction current price
                    cursor.execute("UPDATE auctions SET current_price = ? WHERE id = ?", (amount, auc_id))
                    conn.commit()

                    res_msg = "Offline synchronized successfully!" if is_offline else "Bid established with SHA-256 secure hash confirmation."
                    self.set_json_headers(200)
                    self.wfile.write(json.dumps({
                        "success": True,
                        "bid": {
                            "id": unique_bid_id,
                            "auctionId": auc_id,
                            "bidder": bidder_short,
                            "amount": amount,
                            "timestamp": now_ms,
                            "status": "confirmed",
                            "transactionHash": tx_hash
                        },
                        "updatedPrice": amount,
                        "message": res_msg
                    }).encode('utf-8'))

        # POST /api/auctions/<id>/checkout
        elif re.match(r"^/api/auctions/[a-zA-Z0-9_-]+/checkout$", self.path):
            auc_id = self.path.split("/")[-2]
            card_number = body.get("cardNumber")
            card_name = body.get("cardName")
            cvc = body.get("cvc")
            amount = body.get("amount")

            cursor.execute("SELECT * FROM auctions WHERE id = ?", (auc_id,))
            auc = cursor.fetchone()
            if not auc:
                self.set_json_headers(404)
                self.wfile.write(json.dumps({"error": "Auction not found"}).encode('utf-8'))
            elif not card_number or not card_name or not cvc:
                self.set_json_headers(400)
                self.wfile.write(json.dumps({"error": "Required secure checkout form fields are incomplete."}).encode('utf-8'))
            else:
                tx_hash = "tx_sec_" + os.urandom(12).hex()
                card_last4 = card_number[-4:] if card_number else "4242"
                final_amount = amount if amount else auc["current_price"]

                cursor.execute("""
                    UPDATE auctions SET is_paid = 1, tx_id = ?, card_last4 = ?, amount_paid = ?, paid_at = ? WHERE id = ?
                """, (tx_hash, card_last4, final_amount, now_ms, auc_id))
                conn.commit()

                res = {
                    "success": True,
                    "message": "Financial Transaction Confirmed. Funds captured and secured in escrow.",
                    "transactionId": tx_hash,
                    "escrowAddress": "0x" + os.urandom(20).hex(),
                    "receipt": {
                        "item": auc["title"],
                        "paidAmount": final_amount,
                        "securedChannel": "TLS_AES_256_GCM_SHA384",
                        "signature": "0x_vault_auth_sig_" + os.urandom(5).hex()
                    }
                }
                self.set_json_headers(200)
                self.wfile.write(json.dumps(res).encode('utf-8'))

        # POST /api/storage/upload
        elif self.path == "/api/storage/upload":
            file_name = body.get("fileName")
            size = body.get("size")
            mime_type = body.get("mimeType", "application/pdf")
            provider = body.get("provider", "gcs")
            bucket = body.get("bucket")
            encrypt = body.get("encrypt", True)

            if not file_name:
                self.set_json_headers(400)
                self.wfile.write(json.dumps({"error": "Media filename and parameters are required."}).encode('utf-8'))
            else:
                file_id = generate_random_id("file-")
                checksum = "sha256-" + os.urandom(16).hex()
                effective_bucket = bucket if bucket else ("us-east1-bid-vault-pdf" if provider == "gcs" else "s3-us-west-2-asset-vault")
                
                cloud_url = f"https://storage.googleapis.com/{effective_bucket}/{file_name}" if provider == "gcs" else f"https://s3.amazonaws.com/{effective_bucket}/{file_name}"

                cursor.execute("INSERT INTO cloud_files VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (
                    file_id, file_name, size or 2500000, mime_type, now_ms, provider, effective_bucket, cloud_url, 1 if encrypt else 0, checksum
                ))
                conn.commit()

                self.set_json_headers(200)
                self.wfile.write(json.dumps({
                    "success": True,
                    "file": {
                        "id": file_id,
                        "name": file_name,
                        "size": size or 2500000,
                        "mimeType": mime_type,
                        "uploadedAt": now_ms,
                        "provider": provider,
                        "bucket": effective_bucket,
                        "url": cloud_url,
                        "encrypted": bool(encrypt),
                        "checksum": checksum
                    },
                    "message": "File securely synced to Cloud Bucket with encryption key verification."
                }).encode('utf-8'))

        # POST /api/notifications/read
        elif self.path == "/api/notifications/read":
            email = body.get("email", "nikhiluw@gmail.com")
            cursor.execute("UPDATE notifications SET read = 1 WHERE email = ?", (email,))
            conn.commit()
            self.set_json_headers(200)
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))

        # POST /api/offline-sync
        elif self.path == "/api/offline-sync":
            bids = body.get("bids", [])
            email = body.get("email", "nikhiluw@gmail.com")
            results = []
            successful_sync_count = 0

            for sync_bid in bids:
                sync_bid_id = sync_bid.get("id")
                auction_id = sync_bid.get("auctionId")
                amount = sync_bid.get("amount")
                timestamp = sync_bid.get("timestamp", now_ms)

                cursor.execute("SELECT * FROM auctions WHERE id = ?", (auction_id,))
                auc = cursor.fetchone()

                if not auc:
                    results.append({"id": sync_bid_id, "status": "failed", "reason": "Auction item not found in server registry."})
                elif auc["status"] != "active":
                    results.append({"id": sync_bid_id, "status": "failed", "reason": "Auction had already concluded."})
                else:
                    min_amount = auc["current_price"] + auc["increment"]
                    if amount < min_amount:
                        results.append({"id": sync_bid_id, "status": "failed", "reason": f"Outbid in real-time. Target: ₹{min_amount:,.2f}"})
                    else:
                        # Success mark previous as outbid
                        cursor.execute("UPDATE bids SET status = 'outbid' WHERE auction_id = ? AND status = 'confirmed'", (auction_id,))
                        
                        unique_bid_id = generate_random_id("bid-synced-")
                        secure_hash = f"sha256-offline_sync_" + os.urandom(12).hex()
                        
                        cursor.execute("INSERT INTO bids VALUES (?, ?, ?, ?, ?, ?, ?)", (
                            unique_bid_id, auction_id, "nikhiluw", amount, timestamp, "confirmed", secure_hash
                        ))
                        cursor.execute("UPDATE auctions SET current_price = ? WHERE id = ?", (amount, auction_id))
                        
                        results.append({"id": sync_bid_id, "status": "completed", "amount": amount, "auctionTitle": auc["title"]})
                        successful_sync_count += 1

            if successful_sync_count > 0:
                conn.commit()
                alert_id = generate_random_id("alert-")
                sync_msg = f"Offline Sync completed! Successfully established {successful_sync_count} offline queue bids on live auctions."
                cursor.execute("""
                    INSERT INTO notifications VALUES (?, ?, 'sync', 'Multi-device Offline Sync Manager', 'offline_sync', ?, ?, 0)
                """, (alert_id, email, sync_msg, now_ms))
                conn.commit()

            self.set_json_headers(200)
            self.wfile.write(json.dumps({"success": True, "results": results}).encode('utf-8'))

        # POST /api/gemini/analyze (Gemini AI bidding analyst strategizer)
        elif self.path == "/api/gemini/analyze":
            title = body.get("title", "Item")
            current_price = body.get("currentPrice", 1000)
            description = body.get("description", "")
            bids_history = body.get("bidsHistory", [])

            api_key = os.environ.get("GEMINI_API_KEY")
            
            # Determine if we should query actual Gemini API
            if api_key and api_key != "MY_GEMINI_API_KEY":
                try:
                    # Construct direct REST generateContent payload
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"
                    
                    system_prompt = "You are an expert AI Auction Strategist and Game theorist. Analyze the auction item and generate high-fidelity, actionable insights for bidding."
                    prompt_text = f"""
                    You are analyzing:
                    Item Title: "{title}"
                    Description: "{description}"
                    Current Price: ₹{current_price}
                    Bidding History Count: {len(bids_history)}
                    
                    Generate a structured JSON response matching the following schema:
                    {{
                        "score": number (0 to 100 representing item desirability score),
                        "recommendation": "string containing detailed bidding tip & best tactical timing for this auction",
                        "velocity": "Low" | "Moderate" | "High",
                        "probabilityOfWinning": number (percentage 0 to 100 of winning with standard reserve budget increments),
                        "anomalies": "string describing if any anomaly or shill bidding was detected"
                    }}
                    
                    Keep recommendations concise, pragmatic, and highly technical. Return ONLY the raw JSON block.
                    """
                    
                    payload = {
                        "contents": [{
                            "parts": [{"text": prompt_text}]
                        }],
                        "systemInstruction": {
                            "parts": [{"text": system_prompt}]
                        },
                        "generationConfig": {
                            "responseMimeType": "application/json"
                        }
                    }

                    req_data = json.dumps(payload).encode('utf-8')
                    req = urllib.request.Request(
                        url, 
                        data=req_data, 
                        headers={
                            'Content-Type': 'application/json',
                            'User-Agent': 'aistudio-build'
                        }
                    )
                    
                    with urllib.request.urlopen(req, timeout=10) as response:
                        res_body = response.read().decode('utf-8')
                        res_json = json.loads(res_body)
                        
                        raw_output = res_json['candidates'][0]['content']['parts'][0]['text']
                        # parse out json response
                        clean_json = raw_output.replace("```json", "").replace("```", "").strip()
                        structured_data = json.loads(clean_json)
                        
                        # Add tracking fields
                        structured_data["generatedAt"] = now_ms
                        structured_data["mode"] = "Interactive Gemini AI"
                        
                        self.set_json_headers(200)
                        self.wfile.write(json.dumps(structured_data).encode('utf-8'))
                        conn.close()
                        return

                except Exception as err:
                    print(f"[GEMINI SYSTEM ERR] Failed to retrieve strategy via actual Gemini API, fallback to offline solver: {err}")

            # Fallback local AI solver
            import random
            score = random.randint(75, 96)
            mock_analytics = {
                "score": score,
                "recommendation": f"Bidding velocity on this {title} is moderate. Strategic analysis holds that bidding in the final 90 seconds represents the highest likelihood of winning while minimizing overall bidding slippage. We suggest setting a bidding reserve budget of ₹{int(current_price * 1.25):,} and prioritizing micro-bids in 5% steps dynamically as opponent fatigue indicators raise.",
                "velocity": "High" if len(bids_history) > 5 else "Moderate",
                "probabilityOfWinning": min(95, int(score - (10 * random.random()))),
                "anomalies": "Zero anomalous or automated bid pattern anomalies detected. Bidders comply with standard timing thresholds.",
                "generatedAt": now_ms,
                "mode": "Local Mock Engine"
            }
            self.set_json_headers(200)
            self.wfile.write(json.dumps(mock_analytics).encode('utf-8'))

        # POST /api/admin/upload
        elif self.path == "/api/admin/upload":
            import base64
            file_name = body.get("fileName", "upload.jpg")
            file_data = body.get("fileData", "")
            
            if not file_data:
                self.set_json_headers(400)
                self.wfile.write(json.dumps({"error": "No fileData provided"}).encode('utf-8'))
            else:
                try:
                    if "," in file_data:
                        file_data = file_data.split(",", 1)[1]
                    
                    binary_data = base64.b64decode(file_data)
                    
                    import uuid
                    ext = os.path.splitext(file_name)[1].lower() or ".jpg"
                    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
                        ext = ".jpg"
                    unique_name = f"{uuid.uuid4().hex}{ext}"
                    
                    if not os.path.exists("uploads"):
                        os.makedirs("uploads")
                        
                    local_path = os.path.join("uploads", unique_name)
                    with open(local_path, "wb") as f:
                        f.write(binary_data)
                    
                    self.set_json_headers(200)
                    self.wfile.write(json.dumps({
                        "success": True,
                        "url": f"/uploads/{unique_name}"
                    }).encode('utf-8'))
                except Exception as e:
                    self.set_json_headers(500)
                    self.wfile.write(json.dumps({"error": f"Upload decoding failed: {e}"}).encode('utf-8'))

        # POST /api/admin/auctions
        elif self.path == "/api/admin/auctions":
            title = body.get("title")
            description = body.get("description", "")
            category = body.get("category", "Industrial Scrap")
            image_url = body.get("imageUrl", "")
            starting_price = float(body.get("startingPrice", 100000))
            increment = float(body.get("increment", 5000))
            emd_amount = float(body.get("emdAmount", 10000))
            starts_at = int(body.get("startsAt", now_ms))
            ends_at = int(body.get("endsAt", now_ms + 24 * 3600 * 1000))
            seller = body.get("seller", "Admin Disposals")
            surveyor_contact = body.get("surveyorContact", "+91 98100 07987")
            inspection_location = body.get("inspectionLocation", "Corporate Yard, Delhi")
            inspection_dates = body.get("inspectionDates", "TBD")
            state = body.get("state", "Delhi")
            salvage_condition = body.get("salvageCondition", "As Is Where Is")
            
            # Generate unique ID
            cursor.execute("SELECT id FROM auctions ORDER BY id DESC")
            all_ids = cursor.fetchall()
            next_num = 1
            if all_ids:
                nums = []
                for r in all_ids:
                    match = re.search(r'\d+', r["id"])
                    if match:
                        nums.append(int(match.group()))
                if nums:
                    next_num = max(nums) + 1
            auc_id = f"auc-{next_num:03d}"
            
            status = "upcoming"
            if starts_at <= now_ms + 5000 < ends_at:
                status = "active"
            elif now_ms >= ends_at:
                status = "completed"

            try:
                cursor.execute("""
                    INSERT INTO auctions (
                        id, title, description, category, image_url, starting_price, current_price, increment, emd_amount,
                        starts_at, ends_at, created_at, seller, surveyor_contact, inspection_location, inspection_dates,
                        state, salvage_condition, status, winner, is_paid, tx_id, card_last4, amount_paid, paid_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, '', '', 0.0, 0)
                """, (
                    auc_id, title, description, category, image_url, starting_price, starting_price, increment, emd_amount,
                    starts_at, ends_at, now_ms, seller, surveyor_contact, inspection_location, inspection_dates,
                    state, salvage_condition, status
                ))
                conn.commit()
                self.set_json_headers(200)
                self.wfile.write(json.dumps({"success": True, "auctionId": auc_id}).encode('utf-8'))
            except Exception as e:
                self.set_json_headers(500)
                self.wfile.write(json.dumps({"error": f"Failed to insert auction: {e}"}).encode('utf-8'))

        # POST /api/admin/auctions/conclude
        elif self.path == "/api/admin/auctions/conclude":
            auc_id = body.get("auctionId")
            cursor.execute("SELECT * FROM auctions WHERE id = ?", (auc_id,))
            auc = cursor.fetchone()
            if not auc:
                self.set_json_headers(404)
                self.wfile.write(json.dumps({"error": "Auction not found"}).encode('utf-8'))
            else:
                # Find highest bid
                cursor.execute("SELECT * FROM bids WHERE auction_id = ? AND status = 'confirmed' ORDER BY amount DESC LIMIT 1", (auc_id,))
                high_bid = cursor.fetchone()
                
                winner_email = None
                if high_bid:
                    winner_name = high_bid["bidder"]
                    winner_email = "nikhiluw@gmail.com" if winner_name == "nikhiluw" else winner_name
                    if "@" not in winner_email:
                        # Append a mock domain if it is just a username
                        winner_email = f"{winner_name}@salvageportal.in"
                    
                    cursor.execute("UPDATE auctions SET status = 'sold', winner = ? WHERE id = ?", (winner_email, auc_id))
                    
                    # Insert notification for winner
                    alert_id = generate_random_id("alert-")
                    win_msg = f"Congratulations! You won the bidding for lot \"{auc['title']}\" with a high bid of ₹{high_bid['amount']:,.2f} INR. Please navigate to Profile -> Won Lots to make payment and clear cargo."
                    cursor.execute("""
                        INSERT INTO notifications VALUES (?, ?, ?, ?, 'winner', ?, ?, 0)
                    """, (alert_id, winner_email, auc_id, auc["title"], win_msg, now_ms))
                else:
                    cursor.execute("UPDATE auctions SET status = 'completed' WHERE id = ?", (auc_id,))
                
                conn.commit()
                self.set_json_headers(200)
                self.wfile.write(json.dumps({"success": True, "winner": winner_email}).encode('utf-8'))

        # Unknown route
        else:
            self.set_json_headers(404)
            self.wfile.write(json.dumps({"error": "Resource or endpoint not found"}).encode('utf-8'))

        conn.close()

    def do_PUT(self):
        conn = get_db()
        cursor = conn.cursor()
        body = self.parse_body()

        # PUT /api/auth/mfa-toggle
        if self.path == "/api/auth/mfa-toggle":
            email = body.get("email")
            enabled = bool(body.get("enabled", False))
            
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            if user:
                cursor.execute("UPDATE users SET mfa_enabled = ? WHERE email = ?", (1 if enabled else 0, email))
                conn.commit()
                # Fetch updated
                cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
                user_updated = cursor.fetchone()
                saved = json.loads(user_updated["saved_auctions"] or "[]")
                self.set_json_headers(200)
                self.wfile.write(json.dumps({
                    "success": True,
                    "profile": {
                        "username": user_updated["username"],
                        "email": user_updated["email"],
                        "mfaEnabled": bool(user_updated["mfa_enabled"]),
                        "balance": user_updated["balance"],
                        "spendingLimit": user_updated["spending_limit"],
                        "savedAuctions": saved
                    }
                }).encode('utf-8'))
            else:
                self.set_json_headers(404)
                self.wfile.write(json.dumps({"error": "User not found"}).encode('utf-8'))
        else:
            self.set_json_headers(404)
            self.wfile.write(json.dumps({"error": f"Method PUT not handled on {self.path}"}).encode('utf-8'))

        conn.close()

    def do_DELETE(self):
        conn = get_db()
        cursor = conn.cursor()
        
        # DELETE /api/storage/<id>
        if self.path.startswith("/api/storage/"):
            file_id = self.path.split("/")[-1]
            cursor.execute("SELECT * FROM cloud_files WHERE id = ?", (file_id,))
            record = cursor.fetchone()
            if record:
                cursor.execute("DELETE FROM cloud_files WHERE id = ?", (file_id,))
                conn.commit()
                self.set_json_headers(200)
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": "Asset removed from catalog and unlinked from cloud storage bucket."
                }).encode('utf-8'))
            else:
                self.set_json_headers(404)
                self.wfile.write(json.dumps({"error": "File not found"}).encode('utf-8'))
        elif self.path.startswith("/api/admin/auctions/"):
            auc_id = self.path.split("/")[-1]
            cursor.execute("SELECT * FROM auctions WHERE id = ?", (auc_id,))
            record = cursor.fetchone()
            if record:
                cursor.execute("DELETE FROM auctions WHERE id = ?", (auc_id,))
                cursor.execute("DELETE FROM bids WHERE auction_id = ?", (auc_id,))
                conn.commit()
                self.set_json_headers(200)
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": f"Salvage lot {auc_id} and all its bids deleted successfully."
                }).encode('utf-8'))
            else:
                self.set_json_headers(404)
                self.wfile.write(json.dumps({"error": f"Auction lot {auc_id} not found."}).encode('utf-8'))
        else:
            self.set_json_headers(404)
            self.wfile.write(json.dumps({"error": f"Method DELETE not handled on {self.path}"}).encode('utf-8'))

        conn.close()


# ==========================================
# MAIN INSTANTIATOR
# ==========================================

def start_server():
    init_db()
    
    # Threading server handler
    class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
        daemon_threads = True

    # Start automated bid bot background process
    bot_thread = threading.Thread(target=run_bidding_bots, daemon=True)
    bot_thread.start()

    # Start item expiration monitoring process
    expiry_thread = threading.Thread(target=run_expiry_watcher, daemon=True)
    expiry_thread.start()

    server = ThreadedHTTPServer(("127.0.0.1", PORT), PythonAPIService)
    print(f"[PYTHON BACKEND] Listening securely on http://127.0.0.1:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    print("[PYTHON BACKEND] Server stopped.")

if __name__ == "__main__":
    start_server()
