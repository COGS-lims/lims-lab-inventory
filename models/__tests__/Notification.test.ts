import Notification from "../Notification";


describe("Notification Schema", () => {
    test("valid user passes", async () => {
        const notification = new Notification({
            labId: "lab123",
            type: "DB_UPDATE",
            resourceId: "item123",
            recipients: [
                {
                    role: ["PI", "RESEARCHER"],
                    channel: ["EMAIL"],
                },
            ],
        });
    await expect(notification.validate()).resolves.toBeUndefined();
    });

    test("missing required field fails", async () => {
        const notification = new Notification({
            type: "DB_UPDATE",
            recipients: [
                {
                    role: ["PI", "RESEARCHER"],
                    channel: ["EMAIL"],
                },
            ],
        });
    await expect(notification.validate()).rejects.toThrow();
    });
})