import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterAll,
    type Mock,
} from "vitest";
import { EVENT_COLORS, DAY_EVENT } from "@/providers/events-provider";
import { useEvents } from "@/hooks/use-events";
import * as lib from "@/lib";
import { YEAR, MONTH } from "@/testing/constants";
import {
    CalendarOverflowEvents,
    type CalendarEventCell,
} from "@/features/calendar";

vi.mock("@/lib", async () => {
    const originalModule = await vi.importActual<typeof lib>("@/lib");
    return {
        ...originalModule,
        formatLongDate: vi.fn(),
    };
});

vi.mock("@/hooks/use-events", () => ({
    useEvents: vi.fn(),
}));

const mockEvents: CalendarEventCell[] = [
    {
        colStart: 1,
        colEnd: 2,
        event: {
            kind: DAY_EVENT,
            id: crypto.randomUUID(),
            title: "Test Event 1",
            date: new Date(YEAR, MONTH, 4), // 4th Nov 2024
            startTime: new Date(YEAR, MONTH, 4, 10, 0), // 10:00
            endTime: new Date(YEAR, MONTH, 4, 11, 0), // 11:00
            description: "Test Description",
            color: EVENT_COLORS[0],
        },
    },
    {
        colStart: 1,
        colEnd: 2,
        event: {
            kind: DAY_EVENT,
            id: crypto.randomUUID(),
            title: "Test Event 2",
            date: new Date(YEAR, MONTH, 4), // 4th Nov 2024
            startTime: new Date(YEAR, MONTH, 4, 11, 0), // 11:00
            endTime: new Date(YEAR, MONTH, 4, 12, 0), // 12:00
            description: "Test Description",
            color: EVENT_COLORS[0],
        },
    },
    {
        colStart: 1,
        colEnd: 2,
        event: {
            kind: DAY_EVENT,
            id: crypto.randomUUID(),
            title: "Test Event 3",
            date: new Date(YEAR, MONTH, 4), // 4th Nov 2024
            startTime: new Date(YEAR, MONTH, 4, 12, 0), // 12:00
            endTime: new Date(YEAR, MONTH, 4, 13, 0), // 13:00
            description: "Test Description",
            color: EVENT_COLORS[0],
        },
    },
    {
        colStart: 1,
        colEnd: 2,
        event: {
            kind: DAY_EVENT,
            id: crypto.randomUUID(),
            title: "Test Event 4",
            date: new Date(YEAR, MONTH, 4), // 4th Nov 2024
            startTime: new Date(YEAR, MONTH, 4, 13, 0), // 13:00
            endTime: new Date(YEAR, MONTH, 4, 14, 0), // 14:00
            description: "Test Description",
            color: EVENT_COLORS[0],
        },
    },
];

const mockData = {
    amount: 3,
    colStart: 1,
    colEnd: 2,
    daysOfWeek: [new Date(YEAR, MONTH, 4)],
    events: mockEvents,
};

describe("CalendarOverflowEvents Component", () => {
    beforeEach(() => {
        (useEvents as Mock).mockReturnValue({
            addDraftEvent: vi.fn(),
            removeDraftEvent: vi.fn(),
            updateEvent: vi.fn(),
            removeEvent: vi.fn(),
        });

        (lib.formatLongDate as Mock).mockImplementation(date => {
            return date.toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            });
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    it("renders the button with the correct amount", () => {
        render(<CalendarOverflowEvents {...mockData} />);
        expect(
            screen.getByText(new RegExp(`${mockData.amount}`))
        ).toBeDefined();
    });

    it("opens and closes the popover", () => {
        render(<CalendarOverflowEvents {...mockData} />);

        fireEvent.click(screen.getByTestId("popoverTrigger"));
        expect(screen.getByTestId("popoverContent")).toBeDefined();

        fireEvent.click(screen.getByTestId("closePopoverButton"));
        expect(screen.queryByTestId("popoverContent")).toBeNull();
    });

    it("renders events inside the popover", async () => {
        render(<CalendarOverflowEvents {...mockData} />);

        await userEvent.click(screen.getByTestId("popoverTrigger"));
        expect(screen.getByTestId("popoverContent")).toBeDefined();

        mockData.events.forEach(event => {
            expect(screen.getByText(event.event.title)).toBeDefined();
        });
    });

    it("displays the correct day name in the popover header", async () => {
        render(<CalendarOverflowEvents {...mockData} />);

        fireEvent.click(screen.getByTestId("popoverTrigger"));
        expect(screen.getByTestId("popoverContent")).toBeDefined();

        const dayName = lib.formatLongDate(
            mockData.daysOfWeek[mockData.colStart - 1]
        );
        expect(screen.getByText(dayName)).toBeDefined();
    });
});
