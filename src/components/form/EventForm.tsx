import { useMemo, useEffect, useRef } from "react";
import { addHours } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EVENT_COLORS } from "@/providers/EventsProvider";
import { useSettings } from "@/hooks/useSettings";
import {
    generateTimeSlots,
    generateTimeSlotsFrom,
    parseTimeString,
    formatLongDate,
    formatTime,
    areValuesDefined,
} from "@/lib";

const addEventFormSchema = z.object({
    title: z.string().min(1).max(27),
    description: z.string().max(100),
    fullDay: z.boolean(),
    color: z.enum(EVENT_COLORS),
    date: z.date(),
    dateRange: z.object({
        from: z.date(),
        to: z.date(),
    }),
    startTime: z.string(),
    endTime: z.string(),
});

type EventFormProps = {
    defaultFormValues: Partial<z.infer<typeof addEventFormSchema>>;
};

function EventForm({ defaultFormValues }: EventFormProps) {
    const { weekStartDay } = useSettings();
    const titleInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof addEventFormSchema>>({
        resolver: zodResolver(addEventFormSchema),
        defaultValues: defaultFormValues,
    });

    const watchAllFields = useWatch({
        control: form.control,
    });

    const startTimeSlots = useMemo(() => generateTimeSlots(), []);
    const endTimeSlots = useMemo(() => {
        if (!areValuesDefined(watchAllFields)) {
            return [];
        }

        const startTime = parseTimeString(watchAllFields.startTime);

        return generateTimeSlotsFrom(startTime);
    }, [watchAllFields.startTime]);

    useEffect(() => {
        if (titleInputRef.current) {
            titleInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (!watchAllFields.startTime) {
            return;
        }

        const [hours, minutes] = watchAllFields.startTime
            .split(":")
            .map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        let newEndTime;
        if (hours >= 23) {
            newEndTime = formatTime(new Date(date.setHours(23, 45, 0, 0)));
        } else {
            newEndTime = formatTime(addHours(date, 1));
        }

        form.setValue("endTime", newEndTime);
    }, [watchAllFields.startTime]);

    function onSubmit(values: z.infer<typeof addEventFormSchema>) {}

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    name="title"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder="Add Event"
                                    {...field}
                                    ref={titleInputRef}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name="fullDay"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem className="flex items-center space-x-3">
                            <FormControl>
                                <Switch
                                    id="full-day"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel htmlFor="full-day" className="!mt-0">
                                Celý den
                            </FormLabel>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-wrap gap-3">
                    {!form.watch("fullDay") && (
                        <FormField
                            name="date"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className="font-normal"
                                                >
                                                    {formatLongDate(
                                                        field.value
                                                    )}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                weekStartsOn={weekStartDay}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {form.watch("fullDay") && (
                        <FormField
                            name="dateRange"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className="font-normal"
                                                >
                                                    {formatLongDate(
                                                        field.value.from
                                                    )}{" "}
                                                    -{" "}
                                                    {formatLongDate(
                                                        field.value.to
                                                    )}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="range"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                weekStartsOn={weekStartDay}
                                                numberOfMonths={2}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {!form.watch("fullDay") && (
                        <FormField
                            name="startTime"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectPrimitive.Trigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="font-normal"
                                                >
                                                    {field.value}
                                                </Button>
                                            </SelectPrimitive.Trigger>
                                        </FormControl>
                                        <SelectContent className="min-w-min">
                                            {startTimeSlots.map(timeSlot => (
                                                <SelectItem
                                                    key={timeSlot}
                                                    value={timeSlot}
                                                >
                                                    {timeSlot}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {!form.watch("fullDay") && (
                        <FormField
                            name="endTime"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectPrimitive.Trigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="font-normal"
                                                >
                                                    {field.value}
                                                </Button>
                                            </SelectPrimitive.Trigger>
                                        </FormControl>
                                        <SelectContent className="min-w-min">
                                            {endTimeSlots.map(
                                                ({ timeSlot, duration }) => (
                                                    <SelectItem
                                                        key={timeSlot}
                                                        value={timeSlot}
                                                    >
                                                        {timeSlot} - {duration}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    placeholder="Description"
                                    className="max-h-52 h-16"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                    className="flex flex-wrap gap-2.5"
                                >
                                    {EVENT_COLORS.map(color => (
                                        <div key={color}>
                                            <RadioGroupItem
                                                value={color}
                                                id={`${color}-label`}
                                                className="peer sr-only"
                                            />
                                            <Label
                                                htmlFor={`${color}-label`}
                                                variant="circle"
                                                circleColor={color}
                                            >
                                                <span className="sr-only">
                                                    {color} label
                                                </span>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-x-3">
                    <Button>Uložit</Button>
                </div>
            </form>
        </Form>
    );
}

export { EventForm, addEventFormSchema };