import { Card, CardHeader, CardBody, CardFooter, Divider, Button } from "@nextui-org/react";
import DefaultLayout from '../layouts/default';
import { useNavigate } from 'react-router-dom';


export default function HBContestPage() {

    let navigate = useNavigate();

    return (
        <DefaultLayout>
            <section>
                <Card className="max-w-[800px] bg-red-50 mx-auto">
                    <CardHeader className="flex gap-3">
                        <div className="flex flex-col">
                            <h2 className="text-md">Home Bill Contest</h2>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <p>This contest is to encourage residents to reduce the use of electricity and water usage.
                            This contest would be won by the person with the lowest overall bill average.
                            Join us in this important effort to create a more sustainable future for everyone.
                            Participants would be required to input and upload their bills into the form to ensure integrity and honesty. </p>
                    </CardBody>
                    <Divider />
                    <CardFooter>
                        <div className="flex-col">
                            <div>
                                <h4>Winners</h4>
                                <p>There will 3 winners for each month. Each winner will receive random food vouchers.</p>
                                <p>1st: 3 vouchers</p>
                                <p>2nd: 2 vouchers</p>
                                <p>3rd: 1 voucher</p>
                            </div>
                            <div>
                                <Button
                                    className=" bg-red-500 dark:bg-red-700 text-white"
                                    size="lg"
                                    onPress={() => {
                                        navigate("/hbcform");
                                    }}
                                >
                                    <p className="font-bold">Join</p>
                                </Button>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </section>
        </DefaultLayout>
    )
}

