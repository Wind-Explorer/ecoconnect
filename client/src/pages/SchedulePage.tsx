import {
  Card,
  CardBody,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import DefaultLayout from "../layouts/default";
import { useEffect, useState } from "react";
import config from "../config";
import instance from "../security/http";

interface Schedule {
  id: number;
  dateTime: string;
  location: string;
  postalCode: string;
  status: string;
}

export default function SchedulePage() {
  const [scheduleList, setScheduleList] = useState<Schedule[]>([]);

  useEffect(() => {
    instance
      .get(config.serverAddress + "/schedule")
      .then((res) => {
        const schedules = res.data.map((schedule: Schedule) => ({
          ...schedule,
          dateTime: new Date(schedule.dateTime), // Convert to Date object
        }));
        setScheduleList(schedules);
      })
      .catch((err) => {
        console.error("Error fetching schedules:", err);
      });
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <h1>Karang Guni Schedule</h1>
        <div className="flex flex-col gap-8">
          <Table>
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
                  <TableCell>{schedule.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div>
            <div>
              <div className="flex flex-row gap-20 ">
                <div>
                  <Card>
                    <CardBody>
                      <p className="text-lg">Paper</p>
                      <p className="text-xl">$0.05 to 0.20/KG</p>
                      <ul>
                        <li>Cardboard ($0.20/kg)</li>
                        <li>Newspaper and B&W ($0.11/kg)</li>
                        <li>Mix paper ($0.05/kg)</li>
                      </ul>
                    </CardBody>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardBody>
                      <p className="text-lg">Paper</p>
                      <p className="text-xl">$0.05 to 0.20/KG</p>
                      <ul>
                        <li>Cardboard ($0.20/kg)</li>
                        <li>Newspaper and B&W ($0.11/kg)</li>
                        <li>Mix paper ($0.05/kg)</li>
                      </ul>
                    </CardBody>
                  </Card>
                </div>
                <div>
                  <Card>
                    <CardBody>
                      <p className="text-lg">Paper</p>
                      <p className="text-xl">$0.05 to 0.20/KG</p>
                      <ul>
                        <li>Cardboard ($0.20/kg)</li>
                        <li>Newspaper and B&W ($0.11/kg)</li>
                        <li>Mix paper ($0.05/kg)</li>
                      </ul>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
