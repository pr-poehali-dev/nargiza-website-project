import ContactForm from '@/components/ContactForm';

const TestContact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Тест формы обратной связи</h1>
        <ContactForm />
      </div>
    </div>
  );
};

export default TestContact;
