import { useEffect, useState } from 'react';
import config from '../config';
import instance from '../security/http';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, SortDescriptor, Button } from '@nextui-org/react';
import { EmailIcon, TrashDeleteIcon } from '../icons';

interface FormData {
    id: number;
    electricalBill: number;
    waterBill: number;
    totalBill: number;
    noOfDependents: number;
    avgBill: number;
    ebPicture: string;
    wbPicture: string;
    userId: string;
}

export default function Ranking() {
    const [formData, setFormData] = useState<FormData[]>([]);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: 'avgBill',
        direction: 'ascending',
    });

    useEffect(() => {
        const getFormData = async () => {
            try {
                const response = await instance.get(`${config.serverAddress}/hbcform`);
                const processedData = response.data.map((data: FormData) => ({
                    ...data,
                    electricalBill: Number(data.electricalBill),
                    waterBill: Number(data.waterBill),
                    totalBill: Number(data.totalBill),
                    avgBill: Number(data.avgBill),
                }));
                setFormData(processedData);
            } catch (error) {
                console.log("Failed to fetch form data");
            }
        };

        getFormData();
    }, []);

    const sortFormData = (list: FormData[], descriptor: SortDescriptor) => {
        const { column, direction } = descriptor;

        if (column === 'avgBill') {
            return [...list].sort((a, b) =>
                direction === 'ascending' ? a.avgBill - b.avgBill : b.avgBill - a.avgBill
            );
        }

        return list; // No sorting if the column is not 'avgBill'
    };

    const handleSort = () => {
        const { direction } = sortDescriptor;
        const newDirection = direction === 'ascending' ? 'descending' : 'ascending';

        setSortDescriptor({ column: 'avgBill', direction: newDirection });
    };

    const renderSortIndicator = () => {
        if (sortDescriptor.column === 'avgBill') {
            return sortDescriptor.direction === 'ascending' ? <span>&uarr;</span> : <span>&darr;</span>;
        }
        return null;
    };

    const sortedFormData = sortFormData(formData, sortDescriptor);

    return (
        <section className="flex flex-col items-center justify-center py-5">
            <p className="text-2xl font-bold">Form Data</p>
            <div className="gap-8 p-8">
                <Table aria-label="Form Data Table">
                    <TableHeader>
                        <TableColumn onClick={handleSort}>
                            Average Bill {renderSortIndicator()}
                        </TableColumn>
                        <TableColumn>Form ID</TableColumn>
                        <TableColumn>User ID</TableColumn>
                        <TableColumn>Electrical Bill</TableColumn>
                        <TableColumn>Water Bill</TableColumn>
                        <TableColumn>Total Bill</TableColumn>
                        <TableColumn>Number of Dependents</TableColumn>
                        <TableColumn>Electrical Bill Picture</TableColumn>
                        <TableColumn>Water Bill Picture</TableColumn>
                        <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {sortedFormData.map((data) => (
                            <TableRow key={data.id}>
                                <TableCell>${data.avgBill.toFixed(2)}</TableCell>
                                <TableCell>{data.id}</TableCell>
                                <TableCell>{data.userId}</TableCell>
                                <TableCell>${data.electricalBill.toFixed(2)}</TableCell>
                                <TableCell>${data.waterBill.toFixed(2)}</TableCell>
                                <TableCell>${data.totalBill.toFixed(2)}</TableCell>
                                <TableCell>{data.noOfDependents}</TableCell>
                                <TableCell>
                                    {data.ebPicture && <img src={`${config.serverAddress}/hbcform/ebPicture/${data.id}`} alt="Electrical Bill" className="w-full" />}
                                </TableCell>
                                <TableCell>
                                    {data.wbPicture && <img src={`${config.serverAddress}/hbcform/wbPicture/${data.id}`} alt="Water Bill" className="w-full" />}
                                </TableCell>
                                <TableCell className="flex flex-row">
                                    <Button isIconOnly variant="light"><EmailIcon /></Button>
                                    <Button isIconOnly variant="light"><TrashDeleteIcon /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}
