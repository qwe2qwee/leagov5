import ForgetReset from "@/components/Auth/ForgetReset";

const ResetEmail = () => (
  <ForgetReset type="email" onSuccessRedirect="/(tabs)" />
);

export default ResetEmail;
