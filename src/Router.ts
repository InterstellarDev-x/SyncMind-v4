import { Router, Request, Response } from "express";
const UserRoute: Router = Router();
import { z } from "zod";
import { UserModel, ContenModel, TagModel, SharedlinkModel } from "./db";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import UserMiddleware from "./Middleware";
import { RandomHash } from "./util";

const JWT_SECRET: string = "Second_brain";

const RegisteringSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: "Must be atleast 6 charchacter" }),
}); //  schema for registering and singing the user

type RegisteringSchemaType = z.infer<typeof RegisteringSchema>;

const ContentSchema = z.object({
  tittle: z.string({ message: "please provide the tittle of the content" }),
  link: z.string({ message: "Please provide the link of content" }),
  type: z.string({ message: "Please provide the type of content" }),
  tag: z.string({ message: "provide the tag" }),
});

type ContentSchemaType = z.infer<typeof ContentSchema>;

UserRoute.post("/signup", async (req: Request, res: Response): Promise<any> => {
  const succesRegisterSchema = RegisteringSchema.safeParse(req.body);
  if (!succesRegisterSchema.success) {
    return res.json({
      error: succesRegisterSchema.error.format(),
    });
  }

  const { email, password }: RegisteringSchemaType = req.body;

  try {
    const hashpassword = await bcrypt.hash(password, 5, async (err, hash) => {
      const user = await UserModel.create({
        email: email,
        password: hash,
      });

      return res.status(200).json({
        msg: "User successfully registered",
      });
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      msg: "Server error ",
    });
  }
});

UserRoute.post("/signin", async (req: Request, res: Response): Promise<any> => {
  const succesRegisterSchema = RegisteringSchema.safeParse(req.body);

  if (!succesRegisterSchema.success) {
    return res.json({
      error: succesRegisterSchema.error.format(),
    });
  }

  const { email, password }: RegisteringSchemaType = req.body;

  try {
    const user = await UserModel.findOne({
      email: email,
    });

    if (!user) {
      return res.status(404).json({
        msg: "User is not found ",
      });
    }

    const passwordSucces = await bcrypt.compareSync(
      password,
      user?.password || ""
    );

    if (!passwordSucces) {
      return res.status(403).json({
        msg: "Invalid Credientials",
      });
    } else {
      const token: string = Jwt.sign({ id: user?._id }, JWT_SECRET, {
        algorithm: "HS256",
      });
      return res.status(200).json({
        msg: "you are signed in ",
        token: token,
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      msg: "Intenal server eroor ",
    });
  }
});

UserRoute.post(
  "/content",
  UserMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    const succesContentSchema = ContentSchema.safeParse(req.body);
    if (!succesContentSchema.success) {
      return res.json({
        error: succesContentSchema.error.format(),
      });
    }

    const { tittle, type, tag, link }: ContentSchemaType = req.body;

    const user_id = (req as any).userId;

    try {
      const Findtag = await TagModel.findOne({
        tag: tag,
      });

      console.log(Findtag);
      if (Findtag) {
        console.log("hello im here");
        const tagId = Findtag.id;

        const Content = await ContenModel.create({
          tittle: tittle,
          type: type,
          tag: [tagId],
          link: link,
          user_id: user_id,
        });
      } else {
        const Tag = await TagModel.create({
          tag: tag,
        });

        const Content = await ContenModel.create({
          tittle: tittle,
          type: type,
          tag: [Tag._id],
          link: link,
          user_id: user_id,
        });
      }

      return res.status(200).send(" succesfully posted content ");
    } catch (e) {
      console.log(e);
      return res.status(500).send("Internal server error");
    }
  }
);

UserRoute.get(
  "/content",
  UserMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    const user_id: string = (req as any).userId as string;

    const Course = await ContenModel.find({
      user_id: user_id,
    }).populate("tag");

    return res.status(200).send(Course);
  }
);

UserRoute.delete(
  "/content/:id",
  UserMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    console.log("hello iam reached here");
    const user_id: string = (req as any).userId as string;
    const _id: string = req.params.id as string;

    try {
      await ContenModel.findOneAndDelete({
        _id: _id,
        user_id: user_id,
      });

      return res.status(200).json({
        msg: "Content Deleted Succesfully ",
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        msg: "Internal Server Error",
      });
    }
  }
);

UserRoute.post(
  "/brain/share",
  UserMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    const share: boolean = req.body.share;
    const user_id: string = (req as any).userId as string;
    let shareHash: string = "";

    try {
      if (share) {
        const ExistingLink = await SharedlinkModel.findOne({
          userId: user_id,
        });

        if (ExistingLink) {
          return res.status(200).json({
            message: "Shared link updated ",
            link: "http://localhost:3000/api/v1/brain/" + ExistingLink.hash,
          });
          return;
        }

        shareHash = RandomHash(10);
        const share = await SharedlinkModel.create({
          hash: shareHash,
          userId: user_id,
        });
      } else {
        await SharedlinkModel.findOneAndDelete({
          userId: user_id,
        });

        return res.status(200).json({
          message: "Link Revoked Successfully ",
        });
        return;
      }

      return res.status(200).json({
        message: "Shared link updated ",
        link: "http://localhost:3000/api/v1/brain/" + shareHash,
      });
      return;
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal Server Error",
      });
      return;
    }
  }
);

UserRoute.get(
  "/brain/:shareLink",
  async (req: Request, res: Response): Promise<any> => {
    const hash = req.params.shareLink;

    try {
      const Verifyhash = await SharedlinkModel.findOne({
        hash: hash,
      });

      if (Verifyhash) {
        const user_id = Verifyhash.userId;

        const Allcontents = await ContenModel.find({
          user_id: user_id,
        })
          .populate("tag")
          .populate("user_id", "email");

        return res.status(200).json({ Allcontents });
      } else {
        return res.status(403).json({
          message: "Link is expired ",
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

export default UserRoute;
