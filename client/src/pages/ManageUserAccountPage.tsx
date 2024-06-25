import { useParams } from "react-router-dom";
import DefaultLayout from "../layouts/default";
import UpdateAccountModule from "../components/UpdateAccountModule";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";

export default function ManageUserAccountPage() {
  let { accessToken } = useParams<string>(); // TODO: Replace AT from props with AT from localstorage

  return (
    <DefaultLayout>
      <div>
        <div className="p-8 flex flex-col gap-8">
          <UpdateAccountModule accessToken={accessToken!} />
          <Accordion>
            <AccordionItem
              key="1"
              aria-label="Account danger zone"
              title="More actions"
              className="rounded-xl -m-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="flex flex-row justify-between *:my-auto bg-red-100 dark:bg-red-950 p-4 rounded-xl">
                <div className="flex flex-col">
                  <p className="text-lg">Danger zone</p>
                  <p className="opacity-70">
                    These actions may be destructive. Proceed with caution.
                  </p>
                </div>
                <div className="flex flex-row gap-4">
                  <Button color="danger" variant="light">
                    Reset your password
                  </Button>
                  <Button color="danger" variant="flat">
                    Archive this account
                  </Button>
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </DefaultLayout>
  );
}
