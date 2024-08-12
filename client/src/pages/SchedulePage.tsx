import {
  Button,
  Card,
  CardBody,
  Chip,
  ChipProps,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import config from "../config";
import instance from "../security/http";
import { MagnifyingGlassIcon, XMarkIcon } from "../icons";
import React from "react";

interface Schedule {
  id: number;
  dateTime: Date;
  location: string;
  postalCode: string;
  status: string;
}

const statusColorMap: Record<string, ChipProps["color"]> = {
  "On going": "success",
  "Up coming": "danger",
  Ended: "default",
};

const getStatusColor = (status: string): ChipProps["color"] => {
  return statusColorMap[status] || "default";
};

export default function SchedulePage() {
  const [scheduleList, setScheduleList] = useState<Schedule[]>([]);

  useEffect(() => {
    getSchedule();
  }, []);

  const getSchedule = () => {
    instance
      .get(config.serverAddress + "/schedule")
      .then((res) => {
        const schedules = res.data.map((schedule: Schedule) => ({
          ...schedule,
          dateTime: new Date(schedule.dateTime), // Convert dateTime to Date object
        }));
        // Sort schedules by dateTime in descending order
        schedules.sort((a: Schedule, b: Schedule) => b.dateTime.getTime() - a.dateTime.getTime());
        setScheduleList(schedules);
      })
      .catch((err) => {
        console.error("Error fetching schedules:", err);
      });
  };

  // search
  const [search, setSearch] = useState("");
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchSchedule();
    }
  };

  const onClickSearch = () => {
    searchSchedule();
  };

  const onClickClear = () => {
    setSearch("");
    getSchedule();
  };

  const searchSchedule = () => {
    console.log(`Searching for: ${search}`);
    instance
      .get(`${config.serverAddress}/schedule?search=${search}`)
      .then((res) => {
        const schedules = res.data.map((schedule: Schedule) => ({
          ...schedule,
          dateTime: new Date(schedule.dateTime), // Convert dateTime to Date object
        }));
        // Sort schedules by dateTime in descending order
        schedules.sort((a: Schedule, b: Schedule) => b.dateTime.getTime() - a.dateTime.getTime());
        setScheduleList(schedules);
      })
      .catch((err) => {
        console.error("Error fetching search results:", err);
      });
  };

  return (
    <div className="w-full h-full">
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="flex flex-row gap-10">
          <p className="text-2xl font-bold">Karang Guni Schedule</p>

          <div className="flex gap-4">
            {/* Search Input */}
            <Input
              value={search}
              className="w-[400px]"
              placeholder="Search"
              onChange={onSearchChange}
              onKeyDown={onSearchKeyDown}
              endContent={
                <div className="flex flex-row -mr-3">
                  <Button isIconOnly variant="light" onPress={onClickSearch}>
                    <MagnifyingGlassIcon />
                  </Button>
                  <Button isIconOnly variant="light" onPress={onClickClear}>
                    <XMarkIcon />
                  </Button>
                </div>
              }
            />
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <Table aria-label="Schedule Table">
            <TableHeader>
              <TableColumn>Date</TableColumn>
              <TableColumn>Time</TableColumn>
              <TableColumn>Location</TableColumn>
              <TableColumn>Postal Code</TableColumn>
              <TableColumn>Status</TableColumn>
            </TableHeader>
            <TableBody>
              {scheduleList.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    {(
                      schedule.dateTime as unknown as Date
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {(schedule.dateTime as unknown as Date).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </TableCell>
                  <TableCell>{schedule.location}</TableCell>
                  <TableCell>{schedule.postalCode}</TableCell>
                  <TableCell>
                    <Chip variant="flat" color={getStatusColor(schedule.status)}>
                      {schedule.status}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex flex-row gap-4">
            <div className="flex-1 p-4">
              <Card className="h-full bg-gray-50 border border-gray-200">
                <CardBody>
                  <p className="text-2xl font-semibold text-blue-600 mb-2">Paper</p>
                  <p className="text-xl font-bold text-gray-800 mb-4">$0.05 to 0.20/KG</p>
                  <ul className="list-disc list-inside pl-4 text-gray-700 list-none">
                    <li>Cardboard ($0.20/kg)</li>
                    <li>Newspaper and B&W ($0.11/kg)</li>
                    <li>Mix paper ($0.05/kg)</li>
                  </ul>
                </CardBody>
              </Card>
            </div>
            <div className="flex-1 p-4">
              <Card className="h-full bg-gray-50 border border-gray-200">
                <CardBody>
                  <p className="text-2xl font-semibold text-green-600 mb-2">Electronics</p>
                  <p className="text-xl font-bold text-gray-800 mb-4">$2 to 50/KG</p>
                  <ul className="list-disc list-inside pl-4 text-gray-700 list-none">
                    <li>Flat TV ($5++)</li>
                    <li>Laptop ($10++)</li>
                    <li>Smartphone ($10++)</li>
                  </ul>
                </CardBody>
              </Card>
            </div>
            <div className="flex-1 p-4">
              <Card className="h-full bg-gray-50 border border-gray-200">
                <CardBody>
                  <p className="text-2xl font-semibold text-red-600 mb-2">Clothes</p>
                  <p className="text-xl font-bold text-gray-800 mb-4">$0.20/KG</p>
                  <ul className="list-disc list-inside pl-4 text-gray-700 list-none">
                    <li>Shoe</li>
                    <li>Jewellery</li>
                    <li>Bag</li>
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
