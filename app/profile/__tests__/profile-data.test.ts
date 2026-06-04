import { connectToDatabase } from "@/lib/mongoose";
import LabModel from "@/models/Lab";
import UserLab from "@/models/UserLab";
import { User } from "@/models/User";
import { loadProfileAffiliations } from "@/app/profile/profile-data";

describe("profile affiliation data", () => {
    test("loads the signed-in user's real lab affiliations instead of sample data", async () => {
        await connectToDatabase();

        const user = await User.create({
            email: "profile-test@ucsd.edu",
            name: {
                first: "Profile",
                last: "Tester",
            },
            role: "RESEARCHER",
        });
        const lab = await LabModel.create({
            name: "Real Profile Testing Lab",
            department: "Cognitive Science",
        });

        await UserLab.create({
            user: user._id,
            lab: lab._id,
            role: "RESEARCHER",
            joinedAt: new Date("2026-03-15T12:00:00.000Z"),
        });

        const affiliations = await loadProfileAffiliations("profile-test@ucsd.edu");

        expect(affiliations).toEqual([
            expect.objectContaining({
                labName: "Real Profile Testing Lab",
                role: "Researcher",
                joined: "March 2026",
            }),
        ]);
        expect(affiliations).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    labName: "Xu Computational Neuroscience Lab",
                }),
            ])
        );
    });
});
