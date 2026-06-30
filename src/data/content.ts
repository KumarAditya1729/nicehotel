import executiveImg from "@/assets/hotel/executive.png";
import deluxeImg from "@/assets/hotel/deluxe.png";
import meetingImg from "@/assets/hotel/meeting.png";
import diningImg from "@/assets/hotel/dining.png";
import hallImg from "@/assets/hotel/hall.png";
import dining2Img from "@/assets/hotel/dining2.png";
import meeting1Img from "@/assets/hotel/meeting1.png";
import meetingRoomImg from "@/assets/hotel/meeting-room.jpg";
import gardenTerraceImg from "@/assets/hotel/garden-terrace.jpg";

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
    executive: executiveImg,
    deluxe: deluxeImg,
    meeting: meetingImg,
    dining: diningImg,
    hall: hallImg,
    dining2: dining2Img,
    meeting1: meeting1Img,
    meetingRoom: meetingRoomImg,
    gardenTerrace: gardenTerraceImg,
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
    image: site.images.meetingRoom,
    comingSoon: false,
    description:
      "Comfortable meeting room with essential amenities for small gatherings, training, and discussions.",
    amenities: ["Comfortable Seating", "Sound System", "Natural Light", "Projector", "WiFi", "Refreshments"],
  },
  {
    slug: "garden-terrace",
    name: "Garden Terrace",
    sub: "Open-Air Celebrations",
    badge: "Outdoor Venue",
    rating: 4.8,
    capacity: "80 Guests",
    size: "350 sqm",
    floor: "Ground Floor",
    image: site.images.gardenTerrace,
    comingSoon: false,
    description: "Beautiful open-air garden terrace with scenic views, perfect for evening celebrations and gatherings.",
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

export const realComfortStats = [
  { value: "9", label: "Luxury Rooms" },
  { value: "1", label: "Party Hall" },
  { value: "24/7", label: "Service" },
];

export const hospitality = [
  { icon: "home", title: "Comfortable Rooms", text: "Spacious, well-appointed rooms designed for restful, relaxing stays." },
  { icon: "utensils", title: "Restaurant On-Site", text: "Fine dining and authentic flavours served fresh, all day long." },
  { icon: "sparkles", title: "Modern Amenities", text: "Smart TVs, fast WiFi and modern comforts in every room." },
  { icon: "shield", title: "Safe & Secure", text: "24/7 security and surveillance keeping you safe at all times." },
  { icon: "handshake", title: "Warm Hospitality", text: "Personalised, attentive service from a dedicated team." },
  { icon: "map-pin", title: "Easy Access", text: "Centrally located with easy access to the city and stations." },
  { icon: "building", title: "Event Space", text: "An elegant party hall for celebrations and gatherings." },
  { icon: "key", title: "Central Location", text: "In the heart of Mansa, close to markets and transport." },
  { icon: "leaf", title: "Relaxed Atmosphere", text: "A calm, refined ambiance for an unforgettable escape." },
];

export const breakfastFeature = {
  icon: "coffee",
  title: "Breakfast",
  text: "Start your day with a fresh, hearty breakfast served every morning.",
};

export const curatedPrivileges = [
  { tag: "Stay", title: "Every Need, Cared For", text: "From valet parking to round-the-clock room service, every detail is anticipated so you can simply relax.", image: site.images.executive },
  { tag: "Dining", title: "Memorable Dining", text: "Savour signature dishes crafted with passion, served in a refined and intimate setting.", image: site.images.deluxe },
  { tag: "Events", title: "Family Functions", text: "Host kitty parties, birthdays and gatherings in a beautifully appointed space.", image: site.images.hall },
];
