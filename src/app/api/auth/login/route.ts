import vine, { errors } from "@vinejs/vine";
import { connect } from "@/database/mongo.config";
import { loginSchema } from "@/validator/authSchema";
import { NextRequest, NextResponse } from "next/server";
import ErrorReporter from "@/validator/errorReporter";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import bcrypt from "bcryptjs";
import { User } from "@/model/User";
import { messages } from "@vinejs/vine/defaults";

connect();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validator = vine.compile(loginSchema);
    vine.errorReporter = () => new ErrorReporter();
    const output = await validator.validate(body);
    const user = await User.findOne({ email: output.email });
    if (user) {
      const checkPassword = bcrypt.compareSync(output.password!, user.password);
      if (checkPassword) {
        return NextResponse.json(
          { status: 200, messages: "User Logged In" },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { status: 400, errors: { email: "Please check your password" } },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        status: 400,
        errors: { email: "No account found with this email address" },
      },

      { status: 200 }
    );
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return NextResponse.json(
        { status: 400, errors: error.messages },
        { status: 200 }
      );
    }
  }
}
