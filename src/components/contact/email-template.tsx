import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailTemplateProps {
  fullName: string;
  email: string;
  content: string;
}

export const EmailTemplate = ({
  fullName = "John Doe",
  email = "johndoe@example.com",
  content = "This is a sample message.",
}: EmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>New message from your portfolio site</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Contact Message</Heading>
        <Text style={text}>
          You've received a new message from your portfolio site:
        </Text>
        <Section style={messageContainer}>
          <Text style={messageHeader}>From:</Text>
          <Text style={messageBody}>
            {fullName} ({email})
          </Text>
          <Hr style={hr} />
          <Text style={messageHeader}>Message:</Text>
          <Text style={messageBody}>{content}</Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          This email was sent from your portfolio site&apos;s contact form.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default EmailTemplate;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
};

const messageContainer = {
  backgroundColor: "#f4f4f4",
  borderRadius: "4px",
  padding: "20px",
  margin: "20px 0",
};

const messageHeader = {
  ...text,
  fontWeight: "bold",
  margin: "10px 0 5px",
};

const messageBody = {
  ...text,
  margin: "0 0 10px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  ...text,
  textAlign: "center" as const,
  fontSize: "12px",
  color: "#8898aa",
};
