from flask import Flask, render_template, request, session, redirect
from cs50 import SQL
import json
from datetime import datetime, timedelta
import uuid
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.keys import Keys
import os
import requests
import concurrent.futures
import time
import re

# Initialize Flask application
app = Flask(__name__)

# Configuration for the database
db = SQL("sqlite:///p2p.db")

# Set a secure secret key for session management
app.secret_key = os.environ.get("SECRET_KEY", os.urandom(24))

# Path to geckodriver
GECKODRIVER_PATH = '/Users/akhilbodahanapati/Downloads/Price2Produce-main/geckodriver'

def generate_user_id():
    """Generate a unique user ID."""
    return str(uuid.uuid4())

def get_driver():
    """Configure and return a headless Firefox WebDriver."""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-extensions")
    service = Service(GECKODRIVER_PATH)
    return webdriver.Firefox(service=service, options=options)

def scrape_costco(driver, url):
    """Scrape data from Costco Wholesale (now using Instacart)."""
    items = []
    try:
        driver.get(url)
        
        # Wait for ZIP code input field to appear
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[autocomplete='postal-code']"))
        )
        
        # Enter ZIP code
        zip_input = driver.find_element(By.CSS_SELECTOR, "input[autocomplete='postal-code']")
        zip_input.clear()
        zip_input.send_keys("16046")
        zip_input.send_keys(Keys.ENTER)
        
        # Wait for page to load after ZIP code entry
        time.sleep(3)
        
        # Wait for product cards to appear
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div[aria-label='Product']"))
        )
        
        # Find product cards
        product_cards = driver.find_elements(By.CSS_SELECTOR, "div[aria-label='Product']")[:3]
        
        for card in product_cards:
            try:
                # Get product name
                name_elem = card.find_element(By.CSS_SELECTOR, ".e-147kl2c")
                name = name_elem.text
                
                # Get price - find the price component that contains both dollars and cents
                price_container = card.find_element(By.CSS_SELECTOR, ".e-2feaft")
                
                # Extract price using screen reader text which contains the full price
                screen_reader_elem = price_container.find_element(By.CSS_SELECTOR, ".screen-reader-only")
                price_text = screen_reader_elem.get_attribute("textContent")
                
                # Extract price using regex
                price_match = re.search(r'\$?(\d+\.?\d*)', price_text)
                if price_match:
                    price_float = float(price_match.group(1))
                else:
                    # Alternative approach - try to combine dollar and cent parts
                    try:
                        dollar_part = card.find_element(By.CSS_SELECTOR, ".e-1qkvt8e").text
                        cents_part = card.find_elements(By.CSS_SELECTOR, ".e-p745l")[1].text
                        price_float = float(f"{dollar_part}.{cents_part}")
                    except Exception:
                        # Last resort: extract anything that looks like a price
                        price_text = price_container.text
                        price_match = re.search(r'\$?(\d+\.?\d*)', price_text)
                        if price_match:
                            price_float = float(price_match.group(1))
                        else:
                            continue  # Skip this product if we can't get the price
                
                items.append({'name': name, 'price': price_float, 'quantity': 'N/A'})
            except Exception as e:
                app.logger.error(f"Error extracting Costco product details: {e}")
        
        if items:
            lowest_priced_product = min(items, key=lambda x: x['price'])
            items = [lowest_priced_product]
    except Exception as e:
        app.logger.error(f"An error occurred while scraping Costco: {e}")
    
    return items

def scrape_whole_foods(driver, url):
    """Scrape data from Whole Foods Market."""
    items = []
    try:
        driver.get(url)
        product_names = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".a-size-base-plus.a-color-base.a-text-normal"))
        )
        dollar_prices = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "a-price-whole"))
        )
        cents_prices = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CLASS_NAME, "a-price-fraction"))
        )

        for name_elem, dollar_elem, cents_elem in zip(product_names[:3], dollar_prices[:3], cents_prices[:3]):
            try:
                name = name_elem.text
                dollar = dollar_elem.text
                cents = cents_elem.text
                price_float = float(f"{dollar}.{cents}")
                items.append({'name': name, 'price': price_float, 'quantity': 'N/A'})
            except Exception as e:
                app.logger.error(f"Error extracting data: {e}")

        if items:
            lowest_priced_product = min(items, key=lambda x: x['price'])
            items = [lowest_priced_product]
    except Exception as e:
        app.logger.error(f"An error occurred while scraping Whole Foods: {e}")

    return items

def scrape_doordash_stores(driver, url, shop):
    """Scrape data from DoorDash stores (Target, ALDI, Giant Eagle, Fresh Thyme)."""
    items = []
    try:
        driver.get(url)
        # Wait for product cards to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='RetailItemCardPriceNameInfoBadgingFramework']"))
        )
        
        # Get all product cards
        product_cards = driver.find_elements(By.CSS_SELECTOR, "[data-testid='RetailItemCardPriceNameInfoBadgingFramework']")[:3]
        
        for card in product_cards:
            try:
                # Get product name
                name_elem = card.find_element(By.CSS_SELECTOR, ".Text-sc-1nm69d8-0.dkTAQm")
                name = name_elem.text
                
                # Get price
                price_container = card.find_element(By.CSS_SELECTOR, ".sc-a7623aae-0.kabjex")
                price_text = price_container.text
                
                # Clean up price text and convert to float
                # Extract numbers with decimal point using regex
                price_match = re.search(r'\$?(\d+\.?\d*)', price_text)
                if price_match:
                    price_float = float(price_match.group(1))
                else:
                    # Try alternative approach if regex fails
                    price_float = float(''.join(filter(lambda c: c.isdigit() or c == '.', price_text.replace('$', ''))))
                
                # Get quantity or weight info if available
                try:
                    quantity = card.find_element(By.CSS_SELECTOR, ".Text-sc-1nm69d8-0.gcHNxU").text
                except Exception:
                    # If not found, try alternative selector or use default
                    try:
                        quantity = card.find_element(By.CSS_SELECTOR, ".Text-sc-1nm69d8-0.dCneXH").text
                    except Exception:
                        quantity = "N/A"
                
                items.append({'name': name, 'price': price_float, 'quantity': quantity})
            except Exception as e:
                app.logger.error(f"Error extracting product details: {e}")
        
        if items:
            lowest_priced_product = min(items, key=lambda x: x['price'])
            items = [lowest_priced_product]
    except Exception as e:
        app.logger.error(f"An error occurred while scraping {shop}: {e}")
    
    return items

def scrap_data(url, shop):
    """Scrape data from the given URL for the specified shop."""
    items = []
    driver = get_driver()
    try:
        if shop == 'Costco Wholesale':
            items = scrape_costco(driver, url)
        elif shop == 'Whole Foods Market':
            items = scrape_whole_foods(driver, url)
        else:
            # All DoorDash-based stores use the same scraping function
            items = scrape_doordash_stores(driver, url, shop)
    except Exception as e:
        app.logger.error(f"Error during scraping: {e}")
    finally:
        driver.quit()
        app.logger.info("Browser closed")

    return items

def delete_expired_user_data():
    """Delete expired user data from the database."""
    expiration_time = datetime.now() - timedelta(minutes=3)
    db.execute("DELETE FROM grocery WHERE timestamp < ?", expiration_time.strftime("%Y-%m-%d %H:%M:%S"))
    db.execute("DELETE FROM user_stores WHERE timestamp < ?", expiration_time.strftime("%Y-%m-%d %H:%M:%S"))
    db.execute("DELETE FROM scraped_data WHERE timestamp < ?", expiration_time.strftime("%Y-%m-%d %H:%M:%S"))

@app.before_request
def clear_expired_data():
    """Clear expired data before each request."""
    delete_expired_user_data()

@app.route('/prices')
def prices():
    """Display the prices for the user's selected stores."""
    try:
        if 'user_id' not in session:
            return redirect('/')
        
        user_id = session['user_id']
        store_prices = db.execute("SELECT store_name, item_price FROM scraped_data WHERE user_id = ?", user_id)
        
        store_totals = {}
        for entry in store_prices:
            store_name = entry['store_name']
            item_price = entry['item_price']
            
            try:
                if isinstance(item_price, str):
                    item_price = float(item_price.replace('$', '').replace(',', ''))
                else:
                    item_price = float(item_price)
            except (ValueError, TypeError):
                item_price = 0.0
            
            store_totals[store_name] = store_totals.get(store_name, 0) + item_price
        
        store_totals = {store: round(total, 2) for store, total in store_totals.items()}
        
        return render_template('prices.html', store_totals=store_totals)
    except Exception as e:
        app.logger.error(f"Error: {e}")
        return redirect('/')

@app.route('/', methods=['GET', 'POST'])
def index():
    """Handle the index page."""
    if request.method == "GET":
        delete_expired_user_data()
        session.clear()
        return render_template('index.html')
    else:
        try:
            if 'user_id' not in session:
                session['user_id'] = generate_user_id()
            user_id = session['user_id']
            grocery_list = request.form.get('grocery_list', '[]')
            groceries = json.loads(grocery_list)
            insert_query = "INSERT INTO grocery (user_id, item, quantity, timestamp) VALUES (?, ?, ?, ?)"
            select_query = "SELECT * FROM grocery WHERE user_id = ? AND item = ?"
            for grocery in groceries:
                item = grocery.get('item')
                quantity = grocery.get('quantity')
                if item and quantity:
                    existing_item = db.execute(select_query, user_id, item)
                    if not existing_item:
                        db.execute(insert_query, user_id, item, quantity, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
                else:
                    app.logger.warning(f"Skipping item due to missing data: {grocery}")
            return redirect("/shop")
        except Exception as e:
            app.logger.error(f"Error processing index post request: {e}")
            return "An error occurred while processing your request."

@app.route('/shop', methods=['GET', 'POST'])
def shops():
    """Handle the shop selection page."""
    if request.method == "GET":
        return render_template('shops.html')
    elif request.method == "POST":
        try:
            if 'user_id' not in session:
                session['user_id'] = generate_user_id()
            user_id = session['user_id']
            shop_list = request.form.get('shop_list', '[]')
            shops = json.loads(shop_list)
            insert_query = "INSERT INTO user_stores (user_id, store_name, timestamp) VALUES (?, ?, ?)"
            select_query = "SELECT * FROM user_stores WHERE user_id = ? AND store_name = ?"
            for store in shops:
                store_name = store.get('name')
                if store_name:
                    existing_store = db.execute(select_query, user_id, store_name)
                    if not existing_store:
                        db.execute(insert_query, user_id, store_name, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
                    else:
                        app.logger.info(f"Store {store_name} already exists for user {user_id}")
                else:
                    app.logger.warning(f"Skipping store due to missing data: {store}")
            return redirect("/scrap")
        except Exception as e:
            app.logger.error(f"Error processing shop post request: {e}")
            return "An error occurred while processing your request."

@app.route('/scrap', methods=['GET'])
def scrapped():
    """Scrape data for the user's selected items and stores."""
    try:
        if 'user_id' not in session:
            session['user_id'] = generate_user_id()
        user_id = session['user_id']
        
        shops = db.execute("SELECT store_name FROM user_stores WHERE user_id=?", user_id)
        groceries = db.execute("SELECT item FROM grocery WHERE user_id=?", user_id)
        
        app.logger.info(f"Shops: {shops}")
        app.logger.info(f"Groceries: {groceries}")

        urls = {}
        for store in shops:
            for grocery in groceries:
                shop_name = store['store_name']
                item = grocery['item']
                if shop_name and item:
                    url = {
                        'Target': f'https://www.doordash.com/convenience/store/2628012/search/{item}/',
                        'Whole Foods Market': f'https://www.amazon.com/s?k={item}&i=wholefoods&disableAutoscoping=true',
                        'ALDI': f'https://www.doordash.com/convenience/store/24679254/search/{item}',
                        'Giant Eagle Supermarket': f'https://www.doordash.com/convenience/store/27716049/search/{item}/',
                        'Fresh Thyme Market': f'https://www.doordash.com/convenience/store/1528060/search/{item}/',
                        'Costco Wholesale': f'https://sameday.costco.com/store/costco/s?k={item}'
                    }.get(shop_name)
                    if url:
                        urls[f"{shop_name} - {item}"] = url

        def fetch_and_store_data(url_info):
            url, shop_name, item = url_info
            data = scrap_data(url, shop_name)
            for item_data in data:
                db.execute("INSERT INTO scraped_data (user_id, store_name, item_name, item_price, timestamp, item_quantity) VALUES (?, ?, ?, ?, ?, ?)",
                           user_id, shop_name, item_data['name'], item_data['price'], datetime.now().strftime("%Y-%m-%d %H:%M:%S"), item_data.get('quantity', 'N/A'))

        url_info_list = [(url, shop_name.split(' - ')[0], shop_name.split(' - ')[1]) for shop_name, url in urls.items()]
        
        with concurrent.futures.ThreadPoolExecutor() as executor:
            executor.map(fetch_and_store_data, url_info_list)

        return redirect('/prices')
    except Exception as e:
        app.logger.error(f"Error: {e}")
        return redirect('/')

@app.route('/store/<store_name>')
def store_details(store_name):
    """Display details of items in a specific store."""
    try:
        if 'user_id' not in session:
            return redirect('/')
        
        user_id = session['user_id']
        store_items = db.execute("SELECT item_name, item_price, item_quantity FROM scraped_data WHERE user_id = ? AND store_name = ?", user_id, store_name)
        
        return render_template('store_details.html', store_name=store_name, store_items=store_items)
    except Exception as e:
        app.logger.error(f"Error: {e}")
        return redirect('/')

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)