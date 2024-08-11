import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import instance from '../security/http';
import config from '../config';
import { retrieveUserInformation } from '../security/users';
import { Card, CardHeader, CardBody, CardFooter, Divider, Image } from '@nextui-org/react';

interface Voucher {
    id: string;
    brandLogo: string | null;
    brand: string;
    description: string;
    expirationDate: Date;
    quantityAvailable: number;
    code: string;
}

interface UserVoucher {
    id: string;
    userId: string;
    voucherId: string;
}

export default function UserVoucherPage() {
    const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
    const [vouchers, setVouchers] = useState<Map<string, Voucher>>(new Map());
    const [brandLogoUrls, setBrandLogoUrls] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [userInformation, setUserInformation] = useState<any>(null);

    useEffect(() => {
        const fetchUserInformation = async () => {
            try {
                const response = await retrieveUserInformation();
                setUserInformation(response);
            } catch (error) {
                navigate("/signin");
            }
        };

        fetchUserInformation();
    }, []);

    useEffect(() => {
        const fetchUserVouchers = async () => {
            try {
                if (userInformation && userInformation.id) {
                    // Fetch user vouchers
                    const response = await instance.get(`${config.serverAddress}/user-vouchers/user/${userInformation.id}`);
                    const fetchedUserVouchers = response.data.userVouchers;
                    setUserVouchers(fetchedUserVouchers);

                    // Fetch voucher details
                    const voucherIds = response.data.voucherIds;
                    const voucherDetailsPromises = voucherIds.map((voucherId: string) =>
                        instance.get(`${config.serverAddress}/vouchers/${voucherId}`)
                    );

                    const voucherResponses = await Promise.all(voucherDetailsPromises);
                    const voucherMap = new Map<string, Voucher>();
                    voucherResponses.forEach(response => {
                        const voucher = response.data;
                        voucherMap.set(voucher.id, voucher);

                        // Fetch brand logos
                        if (voucher.brandLogo) {
                            instance
                                .get(`${config.serverAddress}/vouchers/brandLogo/${voucher.id}`, { responseType: 'blob' })
                                .then((res) => {
                                    const url = URL.createObjectURL(res.data);
                                    setBrandLogoUrls(prev => ({ ...prev, [voucher.id]: url }));
                                })
                                .catch(err => console.error(`Error fetching brand logo for voucher ${voucher.id}:`, err));
                        }
                    });

                    setVouchers(voucherMap);
                }
            } catch (error) {
                setError('Failed to fetch vouchers');
            } finally {
                setLoading(false);
            }
        };

        if (userInformation) {
            fetchUserVouchers();
        }
    }, [userInformation]);

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : userVouchers.length === 0 ? (
                <p>You have no vouchers currently.</p>
            ) : (
                <div>
                    <h2>Your Vouchers</h2>
                    <div className="flex flex-wrap gap-4">
                        {userVouchers.map((userVoucher) => {
                            const voucher = vouchers.get(userVoucher.voucherId);
                            return (
                                <Card key={userVoucher.id} className="max-w-xs">
                                    <CardHeader>
                                        {voucher ? (
                                            <Image
                                                alt={voucher.brand}
                                                height={100}
                                                width={100}
                                                src={brandLogoUrls[voucher.id] || '/default-logo.png'}
                                                style={{ objectFit: 'cover' }} // Use style prop for objectFit
                                            />
                                        ) : (
                                            <Image
                                                alt="No image available"
                                                height={100}
                                                width={100}
                                                src='/default-logo.png'
                                                style={{ objectFit: 'cover' }} // Use style prop for objectFit
                                            />
                                        )}
                                    </CardHeader>
                                    <Divider />
                                    <CardBody>
                                        {voucher ? (
                                            <>
                                                <p>{voucher.brand}</p>
                                                <p>{voucher.description}</p>
                                                <p>Code: {voucher.code}</p>
                                                <p>Expires on: {new Date(voucher.expirationDate).toLocaleDateString()}</p>
                                            </>
                                        ) : (
                                            <p>Voucher details are unavailable.</p>
                                        )}
                                    </CardBody>
                                    <Divider />
                                    <CardFooter>
                                        {/* Add any additional footer content here */}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
