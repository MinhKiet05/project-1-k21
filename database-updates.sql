-- Add new columns to messages table for product messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES posts(id);

-- Add index for better performance when querying product messages
CREATE INDEX IF NOT EXISTS idx_messages_product_id ON messages(product_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);

-- Update existing messages to have 'text' type
UPDATE messages SET message_type = 'text' WHERE message_type IS NULL;