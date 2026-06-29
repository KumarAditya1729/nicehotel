const IMG = "https://www.nicehotelandrestaurant.online/images";

export const site = {
  name: "Nice Hotel And Restaurant",
  shortName: "Nice Hotel",
  tagline: "Experience luxury and comfort with our premium hospitality services.",
  location: "Mansa, Punjab",
  address: "Near Chugli Ghar, Mansa 151505",
  phone: "+91 9216400005",
  phoneRaw: "919216400005",
  email: "nicehotelandrestaurant@gmail.com",
  hours: "Always Open",
  roomService: "62394 95531",
  suggestions: "81465 07977",
  instagram: "https://www.instagram.com/nice_hotel_and_resturant/?hl=en",
  whatsapp: "https://wa.me/919216400005",
  images: {
    executive: `${IMG}/executive.png`,
    deluxe: `${IMG}/Delux%20room.png`,
    meeting: `${IMG}/meeting%202.png`,
    dining: `${IMG}/dining%201.png`,
    hall: `${IMG}/kitty%20hall.png`,
  },
};

export const nav = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Rooms", to: "/rooms" },
  { label: "Venue", to: "/venue" },
  { label: "Menu", to: "/menu" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
] as const;

export const heroStats = [
  { icon: "bed", title: "Luxury Rooms", text: "9 premium rooms with world-class amenities", tag: "9 Rooms" },
  { icon: "utensils", title: "Fine Dining", text: "Exquisite cuisine by award-winning chefs", tag: "5-Star Dining" },
  { icon: "building", title: "Event Venues", text: "Elegant halls for Kitty & get together", tag: "1 Hall" },
  { icon: "star", title: "Premium Service", text: "Personalized hospitality at its best", tag: "24/7 Service" },
];

export const rooms = [
  {
    slug: "executive-suite",
    name: "Executive Suite",
    category: "Executive",
    badge: "Most Booked",
    rating: 4.8,
    price: 1500,
    image: site.images.executive,
    size: "45 sqm",
    occupancy: "2 Adults",
    view: "City View",
    description:
      "Spacious executive suite with modern amenities, perfect for business travelers.",
    amenities: ["King Bed", "Smart TV", "Rain Shower", "Work Desk", "Free WiFi", "Air Conditioning", "Room Service"],
  },
  {
    slug: "deluxe-suite",
    name: "Deluxe Suite",
    category: "Deluxe",
    badge: "Luxury Choice",
    rating: 4.9,
    price: 2000,
    image: site.images.deluxe,
    size: "60 sqm",
    occupancy: "2 Adults + 1 Child",
    view: "Panoramic City View",
    description:
      "Elegant deluxe suite with premium furnishings and stunning city views.",
    amenities: ["King Bed", "Smart TV", "Free WiFi", "Premium Toiletries", "Mini Bar", "Work Desk"],
  },
];

export const roomTypes = ["Executive Suite", "Deluxe Suite"];

export const whyChooseRooms = [
  { icon: "award", title: "Premium Quality", text: "Top-rated accommodations with world-class amenities" },
  { icon: "handshake", title: "Personalized Service", text: "Dedicated staff ensuring your comfort and satisfaction" },
  { icon: "map-pin", title: "Prime Location", text: "Centrally located with easy access to city attractions" },
  { icon: "wallet", title: "Best Value", text: "Competitive rates with luxury experience" },
];

export const venues = [
  {
    slug: "party-hall",
    name: "Party Hall",
    sub: "Celebrations & Weddings",
    badge: "Most Popular",
    rating: 4.9,
    capacity: "100 Guests",
    size: "500 sqm",
    floor: "Ground Floor",
    image: site.images.hall,
    comingSoon: false,
    description:
      "Elegant party hall with sophisticated decor. Perfect for kitty parties, and social gatherings.",
    amenities: ["Comfortable Seating", "Sound System", "Elegant Lighting", "Stage", "Chandeliers", "Dance Floor", "Catering", "Parking"],
  },
  {
    slug: "meeting-room",
    name: "Meeting Room",
    sub: "Business & Training",
    badge: "Business Choice",
    rating: 4.7,
    capacity: "10 Guests",
    size: "200 sqm",
    floor: "1st Floor",
    image: site.images.meeting,
    comingSoon: false,
    description:
      "Comfortable meeting room with essential amenities for small gatherings, training, and discussions.",
    amenities: ["Comfortable Seating", "Sound System", "Natural Light", "Projector", "WiFi", "Refreshments"],
  },
  {
    slug: "garden-terrace",
    name: "Garden Terrace",
    sub: "Coming Soon",
    badge: "Coming Soon",
    rating: 4.8,
    capacity: "Coming Soon",
    size: "—",
    floor: "Ground Floor",
    image: `https://images.unsplash.com/photo-1530023367847-a683933f4172?auto=format&fit=crop&w=1200&q=80`,
    comingSoon: true,
    description: "Beautiful outdoor venue with scenic views — Opening Soon!",
    amenities: ["Outdoor Setting", "Scenic Views", "Garden Lighting", "Open Air", "Floral Decor", "Catering"],
  },
];

export const hallPackages = [
  { name: "Kitty Party", price: "₹15,000" },
  { name: "Birthday Party", price: "₹20,000" },
  { name: "Social Gathering", price: "₹25,000" },
  { name: "Custom Package", price: "Contact Us" },
];

export const ballroomFeatures = ["Stage", "Sound System", "Chandeliers", "Dance Floor", "Catering", "Parking"];

export const whyBookVenue = [
  { icon: "target", title: "Perfect Venues", text: "Beautiful spaces for every occasion and guest count" },
  { icon: "briefcase", title: "Expert Planning", text: "Dedicated event coordinators for flawless execution" },
  { icon: "utensils", title: "Premium Catering", text: "Exquisite menus crafted by award-winning chefs" },
  { icon: "sparkles", title: "Luxury Experience", text: "Unforgettable ambiance and world-class service" },
];

export const aboutHighlights = [
  { icon: "bed", title: "9 Luxury Rooms", text: "Executive & Deluxe Suites" },
  { icon: "utensils", title: "Fine Dining", text: "Exquisite Culinary Experiences" },
  { icon: "building", title: "Party Hall", text: "Grand Ballroom for 100 Guests" },
  { icon: "star", title: "Premium Service", text: "24/7 World-Class Hospitality" },
];

export const aboutStats = [
  { value: "9", label: "Luxury Rooms" },
  { value: "100", label: "Banquet Capacity" },
  { value: "24/7", label: "Premium Service" },
  { value: "5★", label: "Star Experience" },
];

export const aboutStory = [
  "Welcome to Nice Hotel & Restaurant, where elegance meets comfort. Our establishment features 9 beautifully designed luxury rooms, a fine dining restaurant, and a magnificent Party hall for weddings, conferences, and special events.",
  "Located in the Center of the city, we offer world-class hospitality with personalized service to make your stay truly memorable.",
];

export const diningCopy =
  "Indulge in culinary excellence at our fine dining restaurant. Our award-winning chefs create exquisite dishes using the finest ingredients, offering both local and international cuisine in an elegant setting. Every plate is a work of art, presented with precision and passion, designed to delight all the senses. The experience is elevated by our restaurant's refined and intimate setting, where soft lighting, impeccable service, and an atmosphere of quiet luxury create the perfect backdrop for a memorable meal.";

export const diningFeatures = ["Breakfast Buffet", "Wine Selection", "Private Dining", "Room Service"];
export const diningHours = [
  { meal: "Breakfast", time: "7:00 – 10:00 AM" },
  { meal: "Lunch", time: "12:00 – 3:00 PM" },
  { meal: "Dinner", time: "7:00 – 11:00 PM" },
];

export const amenities = [
  { icon: "car", title: "Valet Parking", text: "Complimentary parking service" },
  { icon: "wifi", title: "Free WiFi", text: "High-speed internet throughout" },
  { icon: "sparkles", title: "Housekeeping", text: "Daily cleaning & turndown service" },
  { icon: "bell", title: "Concierge", text: "24/7 personalized assistance" },
  { icon: "shield", title: "Secure", text: "24/7 security & surveillance" },
  { icon: "accessibility", title: "Accessible", text: "Wheelchair accessible" },
];

export const locationPoints = [
  "Near Chugli Ghar, Mansa 151505",
  "5 mins from Bus Stand",
  "2 mins from Railway Station",
  "Walking distance to Market",
];

export const services = {
  "Accommodation & Events": [
    { icon: "bed", title: "Luxury Rooms", text: "9 premium rooms with world-class amenities", tags: ["Executive Suite", "Deluxe Suite", "King Bed", "Smart TV"] },
    { icon: "building", title: "Event Venues", text: "Elegant halls for weddings, parties and gatherings", tags: ["Party Hall", "Meeting Room", "100 Guests", "Catering"] },
  ],
  "Amenities & Services": [
    { icon: "car", title: "Valet Parking", text: "Complimentary parking service", tags: ["Secure", "24/7"] },
    { icon: "wifi", title: "Free WiFi", text: "High-speed internet throughout", tags: ["High Speed"] },
    { icon: "sparkles", title: "Housekeeping", text: "Daily cleaning & turndown service", tags: ["Daily"] },
    { icon: "bell", title: "Concierge Service", text: "Personalized assistance for all your needs", tags: ["Tour Bookings", "Restaurant Reservations", "Transportation", "Local Recommendations", "24/7 Support"] },
  ],
  "Dining & Bars": [
    { icon: "utensils", title: "Fine Dining Restaurant", text: "Exquisite cuisine by award-winning chefs", tags: ["Breakfast Buffet", "Wine Selection", "Private Dining", "Room Service"] },
  ],
};

export const offers = [
  { title: "Weekend Package", text: "Unwind with a refined weekend escape — luxury rooms, fine dining and warm hospitality.", tag: "Stay" },
  { title: "Family Package", text: "Spacious deluxe comfort designed for families seeking elegance and ease.", tag: "Family" },
  { title: "Corporate Stay", text: "Executive suites and meeting spaces tailored for the modern business traveler.", tag: "Business" },
  { title: "Dining Offers", text: "Savour signature dishes from our 300+ item menu crafted with passion and tradition.", tag: "Dining" },
];

export type MenuCategory = { category: string; items: { name: string; price: string }[] };
