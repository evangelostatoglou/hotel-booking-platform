import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ApiError,
  checkBookingAvailability,
  createBooking,
  getRooms,
} from "../api";
import type { BookingRoom, RoomType } from "../api";
import { useAuth } from "../auth";
import { GuestCounter } from "../components/GuestCounter";
import { PageLayout } from "../components/PageLayout";
import { formatPrice, getNumberOfNights, getRoomPrice } from "../utils/formatters";

const MAX_GUESTS = 20;

type RoomSelection = {
  id: number;
  roomTypeSlug: string;
  adults: number;
  children: number;
};

type BookingDraft = {
  checkIn: string;
  checkOut: string;
  selections: RoomSelection[];
  availabilityChecked: boolean;
};

const BOOKING_DRAFT_KEY = "hotelTatoliBookingDraft";

// Returns today's date in the format required by a date input.
function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Returns the day after the date supplied to it.
function getNextDateInputValue(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function readBookingDraft(): BookingDraft | null {
  try {
    const savedDraft = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    return savedDraft ? JSON.parse(savedDraft) as BookingDraft : null;
  } catch {
    return null;
  }
}

function roomFitsGuests(room: RoomType, adults: number, children: number) {
  const adultsFit = adults <= (room.capacityAdults ?? 0);
  const childrenFit = children <= (room.capacityChildren ?? 0);
  const totalCapacity = (room.capacityAdults ?? 0) + (room.capacityChildren ?? 0);

  return adultsFit && childrenFit && adults + children <= totalCapacity;
}

function getRoomForSelection(selection: RoomSelection, rooms: RoomType[]) {
  return rooms.find((room) => room.slug === selection.roomTypeSlug);
}

function getBookingRooms(selections: RoomSelection[], rooms: RoomType[]): BookingRoom[] {
  const quantitiesByRoomType = new Map<number, number>();

  selections.forEach((selection) => {
    const room = getRoomForSelection(selection, rooms);
    if (!room) return;

    const currentQuantity = quantitiesByRoomType.get(room.id) ?? 0;
    quantitiesByRoomType.set(room.id, currentQuantity + 1);
  });

  return Array.from(quantitiesByRoomType.entries()).map(([roomTypeId, quantity]) => ({
    roomTypeId,
    quantity,
  }));
}

export function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const requestedRoomType = searchParams.get("roomType") ?? "";
  const [savedDraft] = useState<BookingDraft | null>(readBookingDraft);
  const [checkIn, setCheckIn] = useState(savedDraft?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(savedDraft?.checkOut ?? "");
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [message, setMessage] = useState(savedDraft?.availabilityChecked ? "There is availability for the selected dates." : "");
  const [loading, setLoading] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(savedDraft?.availabilityChecked ?? false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | null>(null);
  const [selections, setSelections] = useState<RoomSelection[]>([
    ...(savedDraft?.selections ?? [{ id: 1, roomTypeSlug: requestedRoomType, adults: 1, children: 0 }]),
  ]);
  const today = getTodayInputValue();
  const earliestCheckOut = getNextDateInputValue(checkIn > today ? checkIn : today);

  const totalAdults = selections.reduce((total, selection) => total + selection.adults, 0);
  const totalChildren = selections.reduce((total, selection) => total + selection.children, 0);
  const totalGuests = totalAdults + totalChildren;
  const numberOfNights = getNumberOfNights(checkIn, checkOut);
  const nightlyTotal = selections.reduce((total, selection) => {
    const room = getRoomForSelection(selection, rooms);
    return total + (room ? getRoomPrice(room) ?? 0 : 0);
  }, 0);
  const bookingTotal = nightlyTotal * numberOfNights;
  const hasMissingPrice = selections.some((selection) => {
    const room = getRoomForSelection(selection, rooms);
    return room && getRoomPrice(room) === null;
  });

  useEffect(() => {
    getRooms()
      .then((loadedRooms) => {
        setRooms(loadedRooms);
        setSelections((currentSelections) => currentSelections.map((selection) => {
          const selectedRoomStillExists = loadedRooms.some((room) => room.slug === selection.roomTypeSlug);
          if (selectedRoomStillExists) return selection;

          const firstSuitableRoom = loadedRooms.find((room) => roomFitsGuests(room, selection.adults, selection.children));
          return { ...selection, roomTypeSlug: firstSuitableRoom?.slug ?? "" };
        }));
      })
      .catch(() => setMessage("Room types are not available yet."));
  }, []);

  // Give the user time to see the confirmation before opening their profile.
  useEffect(() => {
    if (!bookingConfirmed) return;

    const redirectTimer = setTimeout(() => navigate("/profile"), 3000);
    return () => clearTimeout(redirectTimer);
  }, [bookingConfirmed, navigate]);

  function updateSelection(id: number, changes: Partial<RoomSelection>) {
    setAvailabilityChecked(false);
    setMessage("");
    setSelections((currentSelections) => currentSelections.map((selection) => (
      selection.id === id ? { ...selection, ...changes } : selection
    )));
  }

  function getMaximumAdults(selection: RoomSelection) {
    const selectedRoom = getRoomForSelection(selection, rooms);
    const otherGuests = totalGuests - selection.adults - selection.children;
    const roomAdultCapacity = selectedRoom?.capacityAdults ?? Math.max(...rooms.map((room) => room.capacityAdults ?? 0), MAX_GUESTS);
    const roomTotalCapacity = selectedRoom
      ? (selectedRoom.capacityAdults ?? 0) + (selectedRoom.capacityChildren ?? 0)
      : MAX_GUESTS;

    return Math.max(1, Math.min(roomAdultCapacity, roomTotalCapacity - selection.children, MAX_GUESTS - otherGuests - selection.children));
  }

  function getMaximumChildren(selection: RoomSelection) {
    const selectedRoom = getRoomForSelection(selection, rooms);
    const otherGuests = totalGuests - selection.adults - selection.children;
    const roomChildCapacity = selectedRoom?.capacityChildren ?? Math.max(...rooms.map((room) => room.capacityChildren ?? 0), MAX_GUESTS);
    const roomTotalCapacity = selectedRoom
      ? (selectedRoom.capacityAdults ?? 0) + (selectedRoom.capacityChildren ?? 0)
      : MAX_GUESTS;

    return Math.max(0, Math.min(roomChildCapacity, roomTotalCapacity - selection.adults, MAX_GUESTS - otherGuests - selection.adults));
  }

  function addRoomSelection() {
    if (totalGuests >= MAX_GUESTS) {
      setMessage("Hotel Tatoli can accommodate bookings for up to 20 people maximum in one booking.");
      return;
    }

    const nextId = Math.max(...selections.map((selection) => selection.id)) + 1;
    const firstSuitableRoom = rooms.find((room) => roomFitsGuests(room, 1, 0));
    setSelections([...selections, { id: nextId, roomTypeSlug: firstSuitableRoom?.slug ?? "", adults: 1, children: 0 }]);
    setAvailabilityChecked(false);
    setMessage("");
  }

  function removeRoomSelection(id: number) {
    setSelections(selections.filter((selection) => selection.id !== id));
    setAvailabilityChecked(false);
  }

  function changeCheckIn(value: string) {
    setCheckIn(value);
    setAvailabilityChecked(false);
    setMessage("");
  }

  function changeCheckOut(value: string) {
    setCheckOut(value);
    setAvailabilityChecked(false);
    setMessage("");
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (checkIn < today) {
      setMessage("Check-in cannot be in the past.");
      return;
    }

    if (checkOut <= today) {
      setMessage("Check-out must be later than today.");
      return;
    }

    if (checkOut <= checkIn) {
      setMessage("Check-out must be after check-in.");
      return;
    }

    if (selections.some((selection) => !selection.roomTypeSlug)) {
      setMessage("Please choose a room type for every room.");
      return;
    }

    if (selections.some((selection) => !getRoomForSelection(selection, rooms))) {
      setMessage("The selected room types could not be found.");
      return;
    }

    const bookingRooms = getBookingRooms(selections, rooms);

    if (!availabilityChecked) {
      setLoading(true);

      try {
        const result = await checkBookingAvailability({ checkIn, checkOut, rooms: bookingRooms });

        if (!result.availability) {
          setMessage("The selected rooms are not available for these dates.");
          return;
        }

        setAvailabilityChecked(true);
        setMessage("There is availability for the selected dates.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Availability could not be checked.");
      } finally {
        setLoading(false);
      }

      return;
    }

    if (!user) {
      sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify({
        checkIn,
        checkOut,
        selections,
        availabilityChecked: true,
      } satisfies BookingDraft));
      navigate("/auth/login?returnTo=/booking");
      return;
    }

    setLoading(true);

    try {
      const result = await createBooking({
        checkIn,
        checkOut,
        rooms: bookingRooms,
        adults: totalAdults,
        children: totalChildren,
        specialRequest: null,
      });
      sessionStorage.removeItem(BOOKING_DRAFT_KEY);
      setConfirmedBookingId(result.bookingId);
      setBookingConfirmed(true);
      setMessage("");
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        const details = Object.entries(error.errors)
          .flatMap(([field, messages]) => messages.map((text) => `${field}: ${text}`))
          .join("\n");

        setMessage(`${error.message}\n${details}`);
      } else {
        setMessage(error instanceof Error ? error.message : "The booking could not be completed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <section className="simple-page booking-page">
        <p className="eyebrow">RESERVATIONS</p>
        <h1>Book your stay</h1>
        <p>Choose your dates, room types, and guests for each room.</p>

        <form className="simple-form" onSubmit={submitBooking}>
          <label>Check in<input type="date" min={today} value={checkIn} onChange={(event) => changeCheckIn(event.target.value)} required /></label>
          <label>Check out<input type="date" min={earliestCheckOut} value={checkOut} onChange={(event) => changeCheckOut(event.target.value)} required /></label>

          <div className="room-selection-list">
            {selections.map((selection, index) => {
              const selectedRoom = getRoomForSelection(selection, rooms);
              const availableRoomTypes = rooms.filter((room) => roomFitsGuests(room, selection.adults, selection.children));

              return (
                <div className="room-selection" key={selection.id}>
                  <div className="room-selection-heading">
                    <h2>Room {index + 1}</h2>
                    {selections.length > 1 && <button className="remove-room-button" type="button" onClick={() => removeRoomSelection(selection.id)}>Remove</button>}
                  </div>
                  <fieldset className="room-type-options">
                    <legend>Room type</legend>
                    {availableRoomTypes.map((room) => (
                      <label className="room-type-option" key={room.id}>
                        <input
                          type="radio"
                          name={`room-type-${selection.id}`}
                          value={room.slug}
                          checked={selection.roomTypeSlug === room.slug}
                          onChange={() => updateSelection(selection.id, { roomTypeSlug: room.slug })}
                        />
                        {room.name}
                      </label>
                    ))}
                    {rooms.length > 0 && availableRoomTypes.length === 0 && <p className="page-message">No room type can fit these guests.</p>}
                  </fieldset>
                  <div className="room-guest-counters">
                    <GuestCounter label="Adults" value={selection.adults} minimum={1} maximum={getMaximumAdults(selection)} onChange={(value) => updateSelection(selection.id, { adults: value })} />
                    <GuestCounter label="Children" value={selection.children} minimum={0} maximum={getMaximumChildren(selection)} onChange={(value) => updateSelection(selection.id, { children: value })} />
                  </div>
                  <p className="room-capacity-note">
                    {selectedRoom
                      ? `This room accommodates up to ${selectedRoom.capacityAdults ?? 0} adults and ${selectedRoom.capacityChildren ?? 0} children.`
                      : "Select a room type to see its capacity."}
                  </p>
                </div>
              );
            })}
          </div>

          <button className="add-room-button" type="button" onClick={addRoomSelection} disabled={totalGuests >= MAX_GUESTS}>+ Add another room</button>
          {totalGuests === MAX_GUESTS && <p className="guest-limit-message">Hotel Tatoli can accommodate bookings for up to 20 people maximum in one booking.</p>}

          <div className="booking-summary">
            <h2>Booking total</h2>
            {numberOfNights > 0 ? (
              <>
                <p>{numberOfNights} {numberOfNights === 1 ? "night" : "nights"}</p>
                {selections.map((selection, index) => {
                  const room = getRoomForSelection(selection, rooms);
                  const roomPrice = room ? getRoomPrice(room) : null;
                  return <p key={selection.id}>Room {index + 1} ({room?.name ?? "Room type"}): {roomPrice === null ? "Price unavailable" : `${formatPrice(roomPrice)} × ${numberOfNights} = ${formatPrice(roomPrice * numberOfNights)}`}</p>;
                })}
                <strong>Total: {hasMissingPrice ? "Price unavailable" : formatPrice(bookingTotal)}</strong>
              </>
            ) : (
              <>
                <p>Nightly room total</p>
                {selections.map((selection, index) => {
                  const room = getRoomForSelection(selection, rooms);
                  const roomPrice = room ? getRoomPrice(room) : null;
                  return <p key={selection.id}>Room {index + 1} ({room?.name ?? "Room type"}): {roomPrice === null ? "Price unavailable" : formatPrice(roomPrice) + " per night"}</p>;
                })}
                <strong>Total per night: {hasMissingPrice ? "Price unavailable" : formatPrice(nightlyTotal)}</strong>
              </>
            )}
          </div>
          <button className="search-button" type="submit" disabled={loading}>{loading ? availabilityChecked ? "Reserving..." : "Checking..." : availabilityChecked ? "Reserve Now" : "Check Availability"}</button>
        </form>

        {message && <p className="page-message form-error-message">{message}</p>}

        {bookingConfirmed && (
          <div className="confirmation-popup" role="status" aria-live="polite">
            <div className="confirmation-card">
              <h2>Booking has been confirmed</h2>
              <p>Your booking ID is {confirmedBookingId}.</p>
              <p>You will return to your profile in a few seconds.</p>
            </div>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
