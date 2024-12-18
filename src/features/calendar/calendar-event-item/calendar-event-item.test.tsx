import { render, screen, fireEvent } from "@testing-library/react";
import { toast } from "sonner";
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterAll,
    type Mock,
} from "vitest";
import { YEAR, MONTH } from "@/testing/constants";
import {
    CalendarEventItem,
    useEvents,
    EVENT_COLORS,
    DAY_EVENT,
    FULL_DAY_EVENT,
    type Event,
} from "@/features/calendar";

vi.mock("@/features/calendar/hooks/use-events");
vi.mock("sonner");

const mockEvent = {
    id: crypto.randomUUID(),
    kind: DAY_EVENT,
    date: new Date(YEAR, MONTH, 5), // 5th Nov 2024
    startTime: new Date(YEAR, MONTH, 5, 10, 0), // 10:00
    endTime: new Date(YEAR, MONTH, 5, 12, 0), // 12:00
    title: "Test Event",
    color: EVENT_COLORS[0],
    description: "Test Description",
} as Event;

const mockRemoveEvent = vi.fn(() => vi.fn());

describe("CalendarEventItem Component", () => {
    beforeEach(() => {
        (useEvents as Mock).mockReturnValue({
            removeEvent: mockRemoveEvent,
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("renders correctly the DAY_EVENT item with title, start time and color", () => {
        render(<CalendarEventItem event={mockEvent} />);

        expect(screen.getByText("Test Event")).toBeDefined();
        expect(screen.getByText("10:00")).toBeDefined();

        const elementString = screen.getByText("Test Event").outerHTML;
        const regex = new RegExp(`bg-${mockEvent.color}`);

        expect(regex.test(elementString)).toBe(true);
    });

    it("renders correctly the FULL_DAY_EVENT item with title and color", () => {
        const mockEvent = {
            id: crypto.randomUUID(),
            kind: FULL_DAY_EVENT,
            from: new Date(YEAR, MONTH, 4), // 4th Nov 2024
            to: new Date(YEAR, MONTH, 6), // 6th Nov 2024
            title: "Test Event",
            description: "Test Description",
            color: EVENT_COLORS[4],
        } as Event;

        render(<CalendarEventItem event={mockEvent} />);

        expect(screen.getByText("Test Event")).toBeDefined();

        const elementString = screen.getByText("Test Event").outerHTML;
        const regex = new RegExp(`bg-${mockEvent.color}`);

        expect(regex.test(elementString)).toBe(true);
    });

    it("opens the popover on click", () => {
        render(<CalendarEventItem event={mockEvent} />);

        fireEvent.click(screen.getByText("Test Event"));

        expect(screen.getByTestId("popover-content")).toBeDefined();
        expect(screen.getByTestId("event-item-preview")).toBeDefined();
    });

    it("handles event removal", () => {
        render(<CalendarEventItem event={mockEvent} />);

        fireEvent.click(screen.getByText("Test Event"));
        fireEvent.click(screen.getByTestId("remove-event-button"));

        expect(mockRemoveEvent).toHaveBeenCalledWith(mockEvent.id);
        expect(toast).toHaveBeenCalledWith(
            "Událost byla odstraněna",
            expect.any(Object)
        );
    });

    it("handles event editing", () => {
        render(<CalendarEventItem event={mockEvent} />);

        fireEvent.click(screen.getByText("Test Event"));
        fireEvent.click(screen.getByTestId("edit-event-button"));

        expect(screen.getByTestId("popover-content")).toBeDefined();
        expect(screen.getByTestId("update-event-form")).toBeDefined();
    });

    it("closes the popover", () => {
        render(<CalendarEventItem event={mockEvent} />);

        fireEvent.click(screen.getByText("Test Event"));
        fireEvent.click(screen.getByTestId("popover-close-button"));

        expect(screen.queryByTestId("popover-content")).toBeNull();
    });
});
