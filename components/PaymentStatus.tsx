const PaymentStatus = ({
  status,
  errorMessage,
}: {
  status: string;
  errorMessage: string;
}) => {
  switch (status) {
    case "processing":
    case "requires_payment_method":
    case "requires_confirmation":
      return <h2>Processing...</h2>;

    case "requires_action":
      return <h2>Authenticating...</h2>;

    case "succeeded":
      return <h2>Payment Succeeded 🥳</h2>;

    case "error":
      return (
        <>
          <h2>Error 😭</h2>
          <p className="error-message">{errorMessage}</p>
        </>
      );

    default:
      return null;
  }
};

export default PaymentStatus;
