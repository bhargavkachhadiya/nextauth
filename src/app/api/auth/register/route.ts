import vine, { errors } from "@vinejs/vine";
import { connect } from "@/database/mongo.config";
import { registerSchema } from "@/validator/authSchema";
import { NextRequest, NextResponse } from "next/server";
import ErrorReporter from "@/validator/errorReporter";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import bcrypt from "bcryptjs";
import { User } from "@/model/User";

connect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validator = vine.compile(registerSchema);
    vine.errorReporter = () => new ErrorReporter();
    const output = await validator.validate(body);

    // Check is email is already exit
    const user = await User.findOne({ email: output.email });
    if (user) {
      return NextResponse.json(
        {
          status: 400,
          errors: {
            email:
              "Email is already taken. Please use another email address.  ",
          },
        },
        { status: 200 }
      );
    } else {
      // Encrypt the password
      const salt = bcrypt.genSaltSync(10);
      output.password = bcrypt.hashSync(output.password, salt);
      await User.create(output);
      return NextResponse.json(
        {
          status: 200,
          message: "Account created successfully. Please login to your account",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return NextResponse.json(
        { status: 400, errors: error.messages },
        { status: 200 }
      );
    }
  }
}
